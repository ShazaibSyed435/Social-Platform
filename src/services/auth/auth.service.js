// src/services/auth/auth.service.js
const bcrypt = require('bcrypt');
const { AuthUser } = require('./auth.model');
const { UserProfile } = require('../user/user.model');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../../shared/utils/jwt.utils');

const register = async ({ email, password }) => {
  // 1. Check if user exists
  const existing = await AuthUser.findOne({ email });
  if (existing) {
    const err = new Error('Email already registered.');
    err.statusCode = 409;
    throw err;
  }

  // 2. Hash password
  const hashed = await bcrypt.hash(password, 12);

  // 3. Create auth record
  const authUser = await AuthUser.create({ email, password: hashed });

  console.log('New user registered:', authUser.email);

  // 4. Auto-create profile (username from email prefix)
  const username = email.split('@')[0] + '_' + Date.now().toString().slice(-4);
  console.log('Creating profile for user:', username);
  const profile = await UserProfile.create({ authId: authUser._id, username });
  console.log('Profile created with username:', profile.username);

  // 5. Generate tokens
  const payload = { userId: authUser._id, email: authUser.email, role: authUser.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { accessToken, refreshToken, profile };
};

const login = async ({ email, password }) => {
  // 1. Find user
  const authUser = await AuthUser.findOne({ email });
  if (!authUser) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // 2. Compare password
  const isMatch = await bcrypt.compare(password, authUser.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password.');
    err.statusCode = 401;
    throw err;
  }

  // 3. Check if active
  if (!authUser.isActive) {
    const err = new Error('Account is deactivated.');
    err.statusCode = 403;
    throw err;
  }

  // 4. Update last login
  authUser.lastLogin = new Date();
  await authUser.save();

  // 5. Get profile
  const profile = await UserProfile.findOne({ authId: authUser._id });

  // 6. Generate tokens
  const payload = { userId: authUser._id, email: authUser.email, role: authUser.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { accessToken, refreshToken, profile };
};

const refreshTokens = async (token) => {
  if (!token) {
    const err = new Error('Refresh token required.');
    err.statusCode = 401;
    throw err;
  }

  const decoded = verifyRefreshToken(token); // throws if invalid
  const authUser = await AuthUser.findById(decoded.userId);

  if (!authUser || !authUser.isActive) {
    const err = new Error('User not found or inactive.');
    err.statusCode = 401;
    throw err;
  }

  const payload = { userId: authUser._id, email: authUser.email, role: authUser.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  return { accessToken, refreshToken };
};

module.exports = { register, login, refreshTokens };