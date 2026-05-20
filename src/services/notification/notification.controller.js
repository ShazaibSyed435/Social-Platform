const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response.utils');
const notificationService = require('./notification.service');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await notificationService.getMyNotifications(req.user.userId, req.query);
  sendSuccess(res, notifications);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.userId);
  sendSuccess(res, result);
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(req.user.userId, req.params.id);
  sendSuccess(res, notification, 'Notification marked as read.');
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.userId);
  sendSuccess(res, result, 'Notifications marked as read.');
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
