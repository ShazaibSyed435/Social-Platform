const { Notification } = require('./notification.model');
const { UserProfile } = require('../user/user.model');
const { emitToUser } = require('../../shared/socket');

const createNotification = async ({ recipient, sender, type, refModel = null, refId = null, message }) => {
  if (!recipient || !sender || recipient.toString() === sender.toString()) {
    return null;
  }

  const notification = await Notification.create({
    recipient,
    sender,
    type,
    refModel,
    refId,
    message,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate('sender', 'username displayName avatar')
    .select('-__v');

  emitToUser(recipient, 'notification:new', populatedNotification);

  return populatedNotification;
};

const getMyNotifications = async (authId, { page = 1, limit = 20, unreadOnly = false } = {}) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const skip = (Number(page) - 1) * Number(limit);
  const filter = { recipient: profile._id };

  if (unreadOnly === true || unreadOnly === 'true') {
    filter.isRead = false;
  }

  return Notification.find(filter)
    .populate('sender', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .select('-__v');
};

const getUnreadCount = async (authId) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const count = await Notification.countDocuments({ recipient: profile._id, isRead: false });
  return { count };
};

const markAsRead = async (authId, notificationId) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: profile._id },
    { $set: { isRead: true } },
    { new: true }
  ).populate('sender', 'username displayName avatar').select('-__v');

  if (!notification) {
    const err = new Error('Notification not found.');
    err.statusCode = 404;
    throw err;
  }

  emitToUser(profile._id, 'notification:read', notification);

  return notification;
};

const markAllAsRead = async (authId) => {
  const profile = await UserProfile.findOne({ authId });
  if (!profile) {
    const err = new Error('Profile not found.');
    err.statusCode = 404;
    throw err;
  }

  const result = await Notification.updateMany(
    { recipient: profile._id, isRead: false },
    { $set: { isRead: true } }
  );

  emitToUser(profile._id, 'notification:read-all', { modifiedCount: result.modifiedCount });

  return { modifiedCount: result.modifiedCount };
};

module.exports = {
  createNotification,
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
