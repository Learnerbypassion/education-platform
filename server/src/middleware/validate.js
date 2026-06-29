const ApiError = require('../utils/ApiError');

/**
 * Validation middleware factory.
 * Validates request body/params/query against a Joi schema.
 *
 * Usage: validate(schema, 'body')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      throw ApiError.badRequest('Validation failed', errors);
    }

    req[property] = value; // Replace with sanitized values
    next();
  };
};

module.exports = { validate };
