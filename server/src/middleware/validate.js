const { ApiError } = require('../utils/ApiError');

const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };

module.exports = { validate, ApiError };
