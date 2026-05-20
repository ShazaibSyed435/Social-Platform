// src/gateway/index.js
const router = require('express').Router();

router.get('/', (req, res) => {
    res.json({ title: 'Gateway API', message: 'Welcome to the Gateway API!' });
});

router.use('/auth',  require('../services/auth/auth.routes'));
router.use('/users', require('../services/user/user.routes'));
router.use('/posts', require('../services/post/post.routes'));
router.use('/feed',  require('../services/feed/feed.routes'));
router.use('/chat',  require('../services/chat/chat.routes'));
router.use('/notifications', require('../services/notification/notification.routes'));

module.exports = router;
