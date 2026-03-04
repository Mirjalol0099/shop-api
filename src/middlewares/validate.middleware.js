const { ZodError } = require('zod');

module.exports = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    req.body = parsed.body ?? req.body;
    req.query = parsed.query ?? req.query;
    req.params = parsed.params ?? req.params;

    next();
  } catch (e) {
    if (e instanceof ZodError) {
      const err = new Error('Validation error');
      err.status = 400;
      err.details = e.issues.map(i => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return next(err);
    }
    next(e);
  }
};
