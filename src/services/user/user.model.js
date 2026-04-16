// services/user/user.model.js
const mongoose = require('mongoose');
const Joi = require('joi');

const userProfileSchema = new mongoose.Schema({
  authId:      { type: mongoose.Schema.Types.ObjectId, ref: 'AuthUser', required: true, unique: true },
  username:    { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  displayName: { type: String, trim: true, maxlength: 50 },
  bio:         { type: String, maxlength: 160 },
  avatar:      { type: String, default: '' },        // URL
  coverImage:  { type: String, default: '' },        // URL
  location:    { type: String, maxlength: 60 },
  website:     { type: String, maxlength: 100 },
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 },
  postsCount:     { type: Number, default: 0 },
  isPrivate:   { type: Boolean, default: false },
}, { timestamps: true });

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

// ✅ Joi Validation
const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    username:    Joi.string().alphanum().min(3).max(30),
    displayName: Joi.string().max(50),
    bio:         Joi.string().max(160).allow(''),
    avatar:      Joi.string().uri().allow(''),
    location:    Joi.string().max(60).allow(''),
    website:     Joi.string().uri().allow(''),
    isPrivate:   Joi.boolean(),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = { UserProfile, validateProfileUpdate };