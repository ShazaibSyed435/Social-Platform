// src/services/user/user.routes.js
const router = require('express').Router();
const { protect } = require('../../shared/middlewares/auth.middleware');
const validate = require('../../shared/middlewares/validate.middleware');
const { validateProfileUpdate } = require('./user.model');
const {
  getMyProfile, getProfile, updateProfile,
  followUser, unfollowUser, getFollowers, getFollowing,
} = require('./user.controller');

router.get('/me',               protect, getMyProfile);
router.patch('/me',             protect, validate(validateProfileUpdate), updateProfile);
router.get('/:username',        getProfile);          // public
router.post('/:id/follow',      protect, followUser);
router.delete('/:id/follow',    protect, unfollowUser);
router.get('/:id/followers',    getFollowers);        // public
router.get('/:id/following',    getFollowing);        // public

module.exports = router;