// src/services/user/user.controller.js
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response.utils');
const userService = require('./user.service');

// GET /api/users/me
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getMyProfile(req.user.userId);
  sendSuccess(res, profile);
});

// GET /api/users/:username
const getProfile = asyncHandler(async (req, res) => {
  const profile = await userService.getProfileByUsername(req.params.username);
  sendSuccess(res, profile);
});

// PATCH /api/users/me
const updateProfile = asyncHandler(async (req, res) => {
  const profile = await userService.updateProfile(req.user.userId, req.body);
  sendSuccess(res, profile, 'Profile updated.');
});

// POST /api/users/:id/follow
const followUser = asyncHandler(async (req, res) => {
  const myProfile = await userService.getMyProfile(req.user.userId);
  const result = await userService.followUser(myProfile._id, req.params.id);
  sendSuccess(res, result, result.status === 'pending' ? 'Follow request sent.' : 'Followed successfully.');
});

// DELETE /api/users/:id/follow
const unfollowUser = asyncHandler(async (req, res) => {
  const myProfile = await userService.getMyProfile(req.user.userId);
  const result = await userService.unfollowUser(myProfile._id, req.params.id);
  sendSuccess(res, result, 'Unfollowed successfully.');
});

// GET /api/users/:id/followers
const getFollowers = asyncHandler(async (req, res) => {
  const followers = await userService.getFollowers(req.params.id);
  sendSuccess(res, followers);
});

// GET /api/users/:id/following
const getFollowing = asyncHandler(async (req, res) => {
  const following = await userService.getFollowing(req.params.id);
  sendSuccess(res, following);
});

module.exports = {
  getMyProfile,
  getProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};