// services/post/post.model.js
const mongoose = require('mongoose');
const Joi = require('joi');

const postSchema = new mongoose.Schema({
  author:     { type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile', required: true },
  content:    { type: String, required: true, maxlength: 280 },
  media:      [{ url: String, type: { type: String, enum: ['image', 'video'] } }],
  hashtags:   [{ type: String, lowercase: true, trim: true }],
  mentions:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'UserProfile' }],
  likesCount:    { type: Number, default: 0 },
  repliesCount:  { type: Number, default: 0 },
  repostsCount:  { type: Number, default: 0 },
  repostOf:   { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  replyTo:    { type: mongoose.Schema.Types.ObjectId, ref: 'Post', default: null },
  isDeleted:  { type: Boolean, default: false },
  visibility: { type: String, enum: ['public', 'followers', 'private'], default: 'public' },
}, { timestamps: true });

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ hashtags: 1 });

const Post = mongoose.model('Post', postSchema);

// ✅ Joi Validation
const validatePost = (data) => {
  const schema = Joi.object({
    content:    Joi.string().min(1).max(280).required(),
    media:      Joi.array().items(
                  Joi.object({
                    url:  Joi.string().uri().required(),
                    type: Joi.string().valid('image', 'video').required(),
                  })
                ).max(4),
    visibility: Joi.string().valid('public', 'followers', 'private').default('public'),
    replyTo:    Joi.string().hex().length(24).allow(null),
    repostOf:   Joi.string().hex().length(24).allow(null),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = { Post, validatePost };