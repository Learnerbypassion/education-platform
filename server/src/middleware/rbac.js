const ApiError = require('../utils/ApiError');

/**
 * Role-Based Access Control middleware.
 * Accepts one or more roles and checks if the authenticated user has one of them.
 *
 * Usage: authorize('admin', 'instructor')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized('Not authorized');
    }

    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Role '${req.user.role}' is not authorized to access this resource`
      );
    }

    next();
  };
};

module.exports = { authorize };
