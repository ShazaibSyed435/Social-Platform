const { Post, PostLike } = require('./post.model');
const { UserProfile } = require('../user/user.model');
const { Follow } = require('../user/follow.model');
const { createNotification } = require('../notification/notification.service');
const { emitToUser, emitToUsers } = require('../../shared/socket');

const populatePost = (query) => query
  .populate('author', 'username displayName avatar')
  .populate('mentions', 'username displayName avatar')
  .populate({
    path: 'repostOf',
    populate: { path: 'author', select: 'username displayName avatar' },
  })
  .select('-__v');

const extractHashtags = (content = '') => {
  const matches = content.match(/#[a-zA-Z0-9_]+/g) || [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
};

const resolveMentions = async (content = '') => {
  const matches = content.match(/@[a-zA-Z0-9_]+/g) || [];
  const usernames = [...new Set(matches.map((name) => name.slice(1)))];

  if (!usernames.length) return [];

  const profiles = await UserProfile.find({ username: { $in: usernames } }).select('_id');
  return profiles.map((profile) => profile._id);
};

const getPostOrThrow = async (postId) => {
  const post = await Post.findOne({ _id: postId, isDeleted: false });

  if (!post) {
    const err = new Error('Post not found.');
    err.statusCode = 404;
    throw err;
  }

  return post;
};

const ensureOwner = (post, profileId) => {
  if (post.author.toString() !== profileId.toString()) {
    const err = new Error('You are not allowed to modify this post.');
    err.statusCode = 403;
    throw err;
  }
};

const createPost = async (authId, payload) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const parentPost = payload.replyTo ? await getPostOrThrow(payload.replyTo) : null;

  const repostedPost = payload.repostOf ? await getPostOrThrow(payload.repostOf) : null;
  const mentions = await resolveMentions(payload.content);

  const post = await Post.create({
    ...payload,
    author: profile._id,
    hashtags: extractHashtags(payload.content),
    mentions,
  });

  await UserProfile.findByIdAndUpdate(profile._id, { $inc: { postsCount: 1 } });

  if (payload.replyTo) {
    await Post.findByIdAndUpdate(payload.replyTo, { $inc: { repliesCount: 1 } });
    await createNotification({
      recipient: parentPost.author,
      sender: profile._id,
      type: 'comment',
      refModel: 'Post',
      refId: post._id,
      message: 'replied to your post',
    });
  }

  if (payload.repostOf) {
    await Post.findByIdAndUpdate(payload.repostOf, { $inc: { repostsCount: 1 } });
    await createNotification({
      recipient: repostedPost.author,
      sender: profile._id,
      type: 'repost',
      refModel: 'Post',
      refId: post._id,
      message: 'reposted your post',
    });
  }

  await Promise.all(mentions.map((recipient) => createNotification({
    recipient,
    sender: profile._id,
    type: 'mention',
    refModel: 'Post',
    refId: post._id,
    message: 'mentioned you in a post',
  })));

  const populatedPost = await populatePost(Post.findById(post._id));
  const followers = await Follow.find({ following: profile._id, status: 'accepted' }).select('follower');
  const audience = [profile._id, ...followers.map((follow) => follow.follower)];

  emitToUsers(audience, 'post:new', populatedPost);

  return populatedPost;
};

const createRepost = async (authId, postId) => {
  const original = await getPostOrThrow(postId);

  return createPost(authId, {
    content: '',
    repostOf: original._id,
    visibility: original.visibility === 'private' ? 'private' : 'public',
  });
};

const getPostById = async (postId) => {
  const post = await populatePost(Post.findOne({ _id: postId, isDeleted: false }));
  if (!post) {
    const err = new Error('Post not found.');
    err.statusCode = 404;
    throw err;
  }
  return post;
};

const listPostsByUser = async (profileId, { page = 1, limit = 20 } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);

  return populatePost(
    Post.find({ author: profileId, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
  );
};

const updatePost = async (authId, postId, updates) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const post = await getPostOrThrow(postId);
  ensureOwner(post, profile._id);

  const nextUpdates = { ...updates };
  if (updates.content) {
    nextUpdates.hashtags = extractHashtags(updates.content);
    nextUpdates.mentions = await resolveMentions(updates.content);
  }

  await Post.findByIdAndUpdate(postId, { $set: nextUpdates }, { runValidators: true });
  const updatedPost = await getPostById(postId);

  emitToUser(profile._id, 'post:updated', updatedPost);

  return updatedPost;
};

const deletePost = async (authId, postId) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const post = await getPostOrThrow(postId);
  ensureOwner(post, profile._id);

  post.isDeleted = true;
  await post.save();

  await UserProfile.findByIdAndUpdate(profile._id, { $inc: { postsCount: -1 } });

  if (post.replyTo) {
    await Post.findByIdAndUpdate(post.replyTo, { $inc: { repliesCount: -1 } });
  }

  if (post.repostOf) {
    await Post.findByIdAndUpdate(post.repostOf, { $inc: { repostsCount: -1 } });
  }

  emitToUser(profile._id, 'post:deleted', { postId });

  return { deleted: true };
};

const likePost = async (authId, postId) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const post = await getPostOrThrow(postId);

  const existing = await PostLike.findOne({ post: postId, user: profile._id });
  if (existing) {
    const err = new Error('Post already liked.');
    err.statusCode = 409;
    throw err;
  }

  await PostLike.create({ post: postId, user: profile._id });
  await Post.findByIdAndUpdate(postId, { $inc: { likesCount: 1 } });

  await createNotification({
    recipient: post.author,
    sender: profile._id,
    type: 'like',
    refModel: 'Post',
    refId: post._id,
    message: 'liked your post',
  });

  emitToUser(post.author, 'post:liked', {
    postId: post._id,
    likesCount: post.likesCount + 1,
    likedBy: profile._id,
  });

  return { liked: true };
};

const unlikePost = async (authId, postId) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const like = await PostLike.findOneAndDelete({ post: postId, user: profile._id });
  if (!like) {
    const err = new Error('Post is not liked.');
    err.statusCode = 404;
    throw err;
  }

  await Post.findByIdAndUpdate(postId, { $inc: { likesCount: -1 } });
  return { liked: false };
};

module.exports = {
  createPost,
  createRepost,
  getPostById,
  listPostsByUser,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
};
