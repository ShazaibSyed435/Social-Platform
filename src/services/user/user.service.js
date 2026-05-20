// src/services/user/user.service.js
const { UserProfile } = require('./user.model');
const { Follow } = require('./follow.model');
const { createNotification } = require('../notification/notification.service');
const { emitToUser } = require('../../shared/socket');

const getProfileByUsername = async (username) => {
  const profile = await UserProfile.findOne({ username }).select('-__v');
  if (!profile) {
    const err = new Error('User not found.');
    err.statusCode = 404;
    throw err;
  }
  return profile;
};

const getMyProfile = async (authId) => {
  const profile = await UserProfile.findOne({ authId }).select('-__v');
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }
  return profile;
};

const updateProfile = async (authId, updates) => {
  // If username is changing, check uniqueness
  if (updates.username) {
    const taken = await UserProfile.findOne({ username: updates.username });
    if (taken && taken.authId.toString() !== authId.toString()) {
      const err = new Error('Username is already taken.');
      err.statusCode = 409;
      throw err;
    }
  }

  const profile = await UserProfile.findOneAndUpdate(
    { authId },
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-__v');

  return profile;
};

const followUser = async (followerId, followingId) => {
  if (followerId.toString() === followingId.toString()) {
    const err = new Error('You cannot follow yourself.');
    err.statusCode = 400;
    throw err;
  }

  const targetProfile = await UserProfile.findById(followingId);
  if (!targetProfile) {
    const err = new Error('User to follow not found.');
    err.statusCode = 404;
    throw err;
  }

  const status = targetProfile.isPrivate ? 'pending' : 'accepted';

  // findOrCreate follow record
  const existing = await Follow.findOne({ follower: followerId, following: followingId });
  if (existing) {
    const err = new Error('Already following or request pending.');
    err.statusCode = 409;
    throw err;
  }

  const follow = await Follow.create({ follower: followerId, following: followingId, status });

  // Update counts only if accepted
  if (status === 'accepted') {
    await UserProfile.findByIdAndUpdate(followerId,   { $inc: { followingCount: 1 } });
    await UserProfile.findByIdAndUpdate(followingId,  { $inc: { followersCount: 1 } });
  }

  await createNotification({
    recipient: followingId,
    sender: followerId,
    type: status === 'pending' ? 'follow_request' : 'follow',
    refModel: 'Follow',
    refId: follow._id,
    message: status === 'pending' ? 'sent you a follow request' : 'started following you',
  });

  emitToUser(followingId, 'follow:new', {
    followerId,
    followingId,
    status,
  });

  return { status };
};

const unfollowUser = async (followerId, followingId) => {
  const follow = await Follow.findOneAndDelete({ follower: followerId, following: followingId });

  if (!follow) {
    const err = new Error('You are not following this user.');
    err.statusCode = 404;
    throw err;
  }

  if (follow.status === 'accepted') {
    await UserProfile.findByIdAndUpdate(followerId,  { $inc: { followingCount: -1 } });
    await UserProfile.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });
  }

  return { unfollowed: true };
};

const getFollowers = async (profileId) => {
  return Follow.find({ following: profileId, status: 'accepted' })
    .populate('follower', 'username displayName avatar')
    .select('-__v');
};

const getFollowing = async (profileId) => {
  return Follow.find({ follower: profileId, status: 'accepted' })
    .populate('following', 'username displayName avatar')
    .select('-__v');
};

module.exports = {
  getProfileByUsername,
  getMyProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
};
