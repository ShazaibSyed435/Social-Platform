const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response.utils');
const postService = require('./post.service');

const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.user.userId, req.body);
  sendSuccess(res, post, 'Post created.', 201);
});

const getPost = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  sendSuccess(res, post);
});

const getUserPosts = asyncHandler(async (req, res) => {
  const posts = await postService.listPostsByUser(req.params.profileId, req.query);
  sendSuccess(res, posts);
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(req.user.userId, req.params.id, req.body);
  sendSuccess(res, post, 'Post updated.');
});

const deletePost = asyncHandler(async (req, res) => {
  const result = await postService.deletePost(req.user.userId, req.params.id);
  sendSuccess(res, result, 'Post deleted.');
});

const likePost = asyncHandler(async (req, res) => {
  const result = await postService.likePost(req.user.userId, req.params.id);
  sendSuccess(res, result, 'Post liked.');
});

const repost = asyncHandler(async (req, res) => {
  const post = await postService.createRepost(req.user.userId, req.params.id);
  sendSuccess(res, post, 'Post reposted.', 201);
});

const unlikePost = asyncHandler(async (req, res) => {
  const result = await postService.unlikePost(req.user.userId, req.params.id);
  sendSuccess(res, result, 'Post unliked.');
});

module.exports = {
  createPost,
  getPost,
  getUserPosts,
  updatePost,
  deletePost,
  likePost,
  repost,
  unlikePost,
};
