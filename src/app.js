const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const app = express();

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

const {securityStack} = require('./middlewares/security.middleware.js');
const requestLogger = require('./middlewares/request-logger.middleware.js');
const responseWrapper = require('./middlewares/response-wrapper.middleware.js');
const errorHandler = require('./middlewares/error-handler.middleware.js');
const langMiddleware = require('./middlewares/lang.middleware.js');

const authRoutes = require('./modules/auth/auth.routes.js');
const productRoutes = require('./modules/product/product.routes.js');
const orderRoutes = require('./modules/order/order.routes.js');
const userRoutes = require('./modules/users/user.routes.js');
const categoryRoutes = require('./modules/category/category.routes.js');
const brandRoutes = require('./modules/brand/brand.routes.js');

app.use(requestLogger);

const allowed = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim().replace(/\/$/, '')).filter(Boolean);
app.use(...securityStack(allowed));

app.use(express.json());

app.use(langMiddleware);
app.use(responseWrapper);

//Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/api/health', require('./modules/health/health.routes.js'));
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);

app.use('/uploads', express.static('uploads'));

//404 handler
app.use((req, res, next) => {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`)
  err.status = 404;
  next(err);
});

app.use(errorHandler);

module.exports = app;