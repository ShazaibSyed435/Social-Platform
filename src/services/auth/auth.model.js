// services/auth/auth.model.js
const mongoose = require('mongoose');
const Joi = require('joi');

const authUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },  // bcrypt hashed
  isVerified: { type: Boolean, default: false },
  isActive:   { type: Boolean, default: true },
  role:       { type: String, enum: ['user', 'admin'], default: 'user' },
  lastLogin:  { type: Date },
}, { timestamps: true });

const AuthUser = mongoose.model('AuthUser', authUserSchema);

// ✅ Joi Validation
const validateRegister = (data) => {
  const schema = Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().min(8).max(32)
                 .pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
                 .required()
                 .messages({ 'string.pattern.base': 'Password must have 1 uppercase, 1 number, 1 special char' }),
  });
  return schema.validate(data, { abortEarly: false });
};

const validateLogin = (data) => {
  const schema = Joi.object({
    email:    Joi.string().email().required(),
    password: Joi.string().required(),
  });
  return schema.validate(data, { abortEarly: false });
};

module.exports = { AuthUser, validateRegister, validateLogin };