// src/shared/middlewares/validate.middleware.js
const { sendError } = require('../utils/response.utils');

// Factory: pass any Joi schema, returns middleware
const validate = (schemaFn) => (req, res, next) => {
  const { error, value } = schemaFn(req.body);

  if (error) {
    const errors = error.details.map((d) => d.message);
    return sendError(res, 'Validation failed', 400, errors);
  }

  req.body = value; // use sanitized value going forward
  next();
};

module.exports = validate;