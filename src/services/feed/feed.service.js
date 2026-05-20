const { Post } = require('../post/post.model');
const { Follow } = require('../user/follow.model');
const { UserProfile } = require('../user/user.model');

const buildPostQuery = (query) => query
  .populate('author', 'username displayName avatar')
  .populate('mentions', 'username displayName avatar')
  .populate({
    path: 'repostOf',
    populate: { path: 'author', select: 'username displayName avatar' },
  })
  .select('-__v');

const getHomeFeed = async (authId, { page = 1, limit = 20 } = {}) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const follows = await Follow.find({ follower: profile._id, status: 'accepted' }).select('following');
  const followingIds = follows.map((follow) => follow.following);
  const feedAuthorIds = [profile._id, ...followingIds];
  const skip = (Number(page) - 1) * Number(limit);

  return buildPostQuery(
    Post.find({
      isDeleted: false,
      author: { $in: feedAuthorIds },
      $or: [
        { author: profile._id },
        { visibility: { $in: ['public', 'followers'] } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
  );
};

const getExploreFeed = async ({ page = 1, limit = 20, hashtag } = {}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const filter = {
    isDeleted: false,
    visibility: 'public',
  };

  if (hashtag) {
    filter.hashtags = hashtag.replace(/^#/, '').toLowerCase();
  }

  return buildPostQuery(
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
  );
};

module.exports = { getHomeFeed, getExploreFeed };
