// services/chat/chat.model.js
const mongoose = require('mongoose');
const Joi = require('joi');

// Conversation (DM thread)
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' }],
  lastMessage:  { type: mongoose.Schema.Types.ObjectId, ref: 'Message', default: null },
  isGroup:      { type: Boolean, default: false },
  groupName:    { type: String, maxlength: 50 },
}, { timestamps: true });

conversationSchema.index({ participants: 1 });

// Message
const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender:       { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  content:      { type: String, maxlength: 2000 },
  media:        { url: String, type: { type: String, enum: ['image', 'video', 'file'] } },
  isRead:       { type: Boolean, default: false },
  isDeleted:    { type: Boolean, default: false },
  readBy:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' }],
}, { timestamps: true });

messageSchema.index({ conversation: 1, createdAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
const Message      = mongoose.model('Message', messageSchema);

// ✅ Joi Validation
const validateMessage = (data) => {
  const schema = Joi.object({
    conversationId: Joi.string().hex().length(24).required(),
    content:        Joi.string().min(1).max(2000),
    media:          Joi.object({
                      url:  Joi.string().uri().required(),
                      type: Joi.string().valid('image', 'video', 'file').required(),
                    }),
  }).or('content', 'media'); // at least one required
  return schema.validate(data, { abortEarly: false });
};

module.exports = { Conversation, Message, validateMessage };