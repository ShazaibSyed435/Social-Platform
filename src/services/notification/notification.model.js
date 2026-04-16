// services/notification/notification.model.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  type:      {
    type: String,
    enum: ['like', 'comment', 'follow', 'mention', 'repost', 'follow_request'],
    required: true,
  },
  refModel:  { type: String, enum: ['Post', 'Follow'], default: null }, // what it links to
  refId:     { type: mongoose.Schema.Types.ObjectId, default: null },
  isRead:    { type: Boolean, default: false },
  message:   { type: String, maxlength: 100 },
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = { Notification };