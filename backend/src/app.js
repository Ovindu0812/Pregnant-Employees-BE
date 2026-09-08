require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');

const ApiError = require('./utils/ApiError');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const assessmentRoutes = require('./routes/assessmentRoutes');
const legalRoutes = require('./routes/legalRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const adminRoutes = require('./routes/adminRoutes');

const {
  notFound,
  errorHandler,
} = require('./middleware/errorMiddleware');

const app = express();

/*
|--------------------------------------------------------------------------
| Allowed Origins
|--------------------------------------------------------------------------
|
| Production:
|   FRONTEND_URL=https://new-pregnant-employees-fe.vercel.app
|
| Optional:
|   FRONTEND_ORIGINS=https://domain1.com,https://domain2.com
|
| Local development:
|   http://localhost:5173
|   http://localhost:5174
|
*/

const allowedOrigins = [
  process.env.FRONTEND_URL,

  ...(process.env.FRONTEND_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  'http://localhost:5173',
  'http://localhost:5174',

  // Production frontend domain
  'https://new-pregnant-employees-fe.vercel.app',

  // Keep old deployment URL temporarily if needed
  'https://new-pregnant-employees-o0eyh7d1f-ovindu0812s-projects.vercel.app',
]
  .map((origin) => origin && origin.trim())
  .filter(Boolean);

/*
|--------------------------------------------------------------------------
| Safe Environment Diagnostics
|--------------------------------------------------------------------------
|
| Never log secret values.
|
*/

if (process.env.NODE_ENV !== 'test') {
  console.log('Environment check:', {
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    frontendUrl: process.env.FRONTEND_URL || null,
    nodeEnv: process.env.NODE_ENV || null,
  });

  console.log('Allowed frontend origins:', allowedOrigins);
}

/*
|--------------------------------------------------------------------------
| Basic Express Security
|--------------------------------------------------------------------------
*/

app.disable('x-powered-by');

/*
|--------------------------------------------------------------------------
| CORS
|--------------------------------------------------------------------------
*/

const corsOptions = {
  origin: (origin, callback) => {
    // curl, Postman, server-to-server requests may not have Origin.
    if (!origin) {
      return callback(null, true);
    }

    // Explicitly allowed origins.
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // During local development allow localhost / 127.0.0.1 on any port.
    if (
      process.env.NODE_ENV !== 'production' &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }

    console.warn(`Blocked CORS origin: ${origin}`);

    return callback(
      new ApiError(
        403,
        `CORS origin is not allowed: ${origin}`
      )
    );
  },

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],

  credentials: true,

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// Explicitly support preflight requests.
app.options(/.*/, cors(corsOptions));

/*
|--------------------------------------------------------------------------
| Body Parsing
|--------------------------------------------------------------------------
*/

app.use(
  express.json({
    limit: '100kb',
  })
);

/*
|--------------------------------------------------------------------------
| Cache
|--------------------------------------------------------------------------
*/

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

/*
|--------------------------------------------------------------------------
| Health Route
|--------------------------------------------------------------------------
*/

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'SafeMum API is running',
  });
});

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes);

app.use('/api/users', userRoutes);

app.use('/api/assessments', assessmentRoutes);

app.use('/api/legal', legalRoutes);

app.use('/api/recommendations', recommendationRoutes);

app.use('/api/feedback', feedbackRoutes);

app.use('/api/admin', adminRoutes);

/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(notFound);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorHandler);

module.exports = app;