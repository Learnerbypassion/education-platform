const crypto = require('crypto');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');
const emailService = require('./emailService');

class AuthService {
  /**
   * Register a new user.
   */
  async register({ name, email, password, role }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Email already registered');
    }

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id, user.role);

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user).catch(console.error);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
      },
      token,
    };
  }

  /**
   * Login user with email and password.
   */
  async login({ email, password }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = generateToken(user._id, user.role);

    return {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        bio: user.bio,
      },
      token,
    };
  }

  /**
   * Generate password reset token and send email.
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError.notFound('No account found with that email');
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // Send email (non-blocking)
    emailService.sendPasswordResetEmail(user, resetToken).catch(console.error);

    return { message: 'Password reset email sent' };
  }

  /**
   * Reset password using token.
   */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return { message: 'Password reset successful' };
  }
}

module.exports = new AuthService();
