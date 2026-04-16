// src/services/auth/auth.controller.js
const asyncHandler = require('../../shared/utils/asyncHandler');
const { sendSuccess } = require('../../shared/utils/response.utils');
const authService = require('./auth.service');

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, profile } = await authService.register(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  sendSuccess(res, { accessToken, profile }, 'Account created successfully.', 201);
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { accessToken, refreshToken, profile } = await authService.login(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, { accessToken, profile }, 'Login successful.');
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  const { accessToken, refreshToken } = await authService.refreshTokens(token);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendSuccess(res, { accessToken }, 'Token refreshed.');
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  sendSuccess(res, {}, 'Logged out successfully.');
});

module.exports = { register, login, refresh, logout };