const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const { env } = require('./config/env');
const { configureCloudinary } = require('./config/cloudinary');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const catalogRoutes = require('./routes/catalogRoutes');
const commerceRoutes = require('./routes/commerceRoutes');
const contentRoutes = require('./routes/contentRoutes');

const app = express();

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

// Local product images (used until Cloudinary is configured)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use(
  cors({
    origin: [env.CLIENT_URL, env.ADMIN_URL],
    credentials: true,
  }),
);

app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});
app.use(hpp());

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'SQ Perfumes API is healthy',
    env: env.NODE_ENV,
    imageStorage: configureCloudinary() ? 'cloudinary' : 'unconfigured',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api', catalogRoutes);
app.use('/api', commerceRoutes);
app.use('/api', contentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
