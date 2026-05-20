const router = require('express').Router();
const { protect } = require('../../shared/middlewares/auth.middleware');
const validate = require('../../shared/middlewares/validate.middleware');
const { validatePost, validatePostUpdate } = require('./post.model');
const {
  createPost,
  getPost,
  getUserPosts,
  updatePost,
  deletePost,
  likePost,
  repost,
  unlikePost,
} = require('./post.controller');

router.post('/', protect, validate(validatePost), createPost);
router.get('/user/:profileId', getUserPosts);
router.get('/:id', getPost);
router.patch('/:id', protect, validate(validatePostUpdate), updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);
router.delete('/:id/like', protect, unlikePost);
router.post('/:id/repost', protect, repost);

module.exports = router;
