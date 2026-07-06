const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const authService = require('../services/authService');
const { generateToken } = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  ApiResponse.created(res, 'Registration successful', result);
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  ApiResponse.success(res, 'Login successful', result);
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  ApiResponse.success(res, result.message);
});

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body.token, req.body.password);
  ApiResponse.success(res, result.message);
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  ApiResponse.success(res, 'User profile', req.user);
});

// @desc    OAuth Callback (Google & GitHub)
// @route   GET /api/auth/:provider/callback
// @access  Public
const oauthCallback = asyncHandler(async (req, res) => {
  // req.user is set by passport
  const token = generateToken(req.user._id, req.user.role);
  // Redirect to frontend with token
  res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
});

module.exports = { register, login, forgotPassword, resetPassword, getMe, oauthCallback };
