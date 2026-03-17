const { z } = require('zod');

function validate(schema) {
  return (req, _res, next) => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      return next({ statusCode: 400, message: 'Validation error', details: parsed.error.flatten() });
    }

    req.body = parsed.data.body;
    req.params = parsed.data.params;
    req.query = parsed.data.query;
    return next();
  };
}

module.exports = { validate, z };
