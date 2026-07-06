const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, forgotPassword, resetPassword, getMe, oauthCallback } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');
const config = require('../config/env');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.get('/me', protect, getMe);

// OAuth Routes
const oauthFailureRedirect = `${config.clientUrl}/login`;
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: oauthFailureRedirect, session: false }), oauthCallback);

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
router.get('/github/callback', passport.authenticate('github', { failureRedirect: oauthFailureRedirect, session: false }), oauthCallback);

module.exports = router;
