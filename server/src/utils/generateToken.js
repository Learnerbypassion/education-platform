const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a JWT token for a user.
 */
const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpire,
  });
};

/**
 * Verify a JWT token.
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = { generateToken, verifyToken };
