const router = require('express').Router();
const { protect } = require('../../shared/middlewares/auth.middleware');
const { getHomeFeed, getExploreFeed } = require('./feed.controller');

router.get('/', protect, getHomeFeed);
router.get('/explore', getExploreFeed);

module.exports = router;
