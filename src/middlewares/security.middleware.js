const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

exports.securityStack = (allowedOrigins = []) => {
  const corsMw = cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      
      const err = new Error('CORS BLOCKED');
      err.status = 403;
      return cb(err, false);
    },
    credentials: true,
  });

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 120, // 1 daqiqada 120 request
    standardHeaders: true,
    legacyHeaders: false,
  });

  return [
    helmet(),
    corsMw,
    limiter,
  ];
};
