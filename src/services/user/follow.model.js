// services/user/follow.model.js
const mongoose = require('mongoose');
const Joi = require('joi');

const followSchema = new mongoose.Schema({
  follower:  { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  following: { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  status:    { type: String, enum: ['pending', 'accepted'], default: 'accepted' }, // pending for private accounts
}, { timestamps: true });

// Compound index — prevents duplicate follows
followSchema.index({ follower: 1, following: 1 }, { unique: true });

const Follow = mongoose.model('Follow', followSchema);

// ✅ Joi Validation
const validateFollow = (data) => {
  const schema = Joi.object({
    followingId: Joi.string().hex().length(24).required(), // MongoDB ObjectId
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = { Follow, validateFollow };