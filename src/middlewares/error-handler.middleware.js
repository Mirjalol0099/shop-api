const logger = require('../utils/logger.js');

function prismaToHttp(err) {
  const code = err?.code;

  if (code === 'P2002') return { status: 409, message: 'Duplicate resource' };
  if (code === 'P2003') return { status: 400, message: 'Invalid reference (foreign key)' };
  if (code === 'P2025') return { status: 404, message: 'Not found' };

  return null;
}

module.exports = function errorHandler(err, req, res, next) {
  const mapped = prismaToHttp(err);

  const status = mapped?.status || err.status || 500;
  const message = mapped?.message || err.message || 'Internal Server Error';

  logger.error({
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    status,
    message, 
    stack: process.env.NODE_ENV === 'production' ? undefined: err.stack,
  });

  // Agar headers allaqachon jo‘natilgan bo‘lsa
  if (res.headersSent) return next(err);

  res.status(status).json({
    success: false,
    message,
    requestId: req.requestId || 'n/a',
  });
};
