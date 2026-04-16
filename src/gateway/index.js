// src/gateway/index.js
const router = require('express').Router();

router.get('/', (req, res) => {
    res.json({ title: 'Gateway API', message: 'Welcome to the Gateway API!' });
});

router.use('/auth',  require('../services/auth/auth.routes'));
router.use('/users', require('../services/user/user.routes'));
// router.use('/posts', require('../services/post/post.routes'));   // next phase
// router.use('/feed',  require('../services/feed/feed.routes'));   // next phase

module.exports = router;