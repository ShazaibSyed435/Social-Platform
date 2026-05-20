const router = require('express').Router();
const { protect } = require('../../shared/middlewares/auth.middleware');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} = require('./notification.controller');

router.use(protect);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;
