const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response.utils');
const feedService = require('./feed.service');

const getHomeFeed = asyncHandler(async (req, res) => {
  const posts = await feedService.getHomeFeed(req.user.userId, req.query);
  sendSuccess(res, posts);
});

const getExploreFeed = asyncHandler(async (req, res) => {
  const posts = await feedService.getExploreFeed(req.query);
  sendSuccess(res, posts);
});

module.exports = { getHomeFeed, getExploreFeed };
