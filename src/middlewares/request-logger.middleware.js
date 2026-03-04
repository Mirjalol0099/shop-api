const logger = require('../utils/logger.js');

module.exports = function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  const rid = `${Date.now().toString(36)}-${Math.random().toString(16).slice(2)}`;
  req.requestId = rid;
  res.setHeader('X-Request-Id', rid);

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const ms = Number(end - start) / 1e6;

    logger.info({
      requestId: rid,
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      durationMs: Number(ms.toFixed(1)),
      userId: req.user?.id || null,
      role: req.user?.role || null,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  });

  next();
};
