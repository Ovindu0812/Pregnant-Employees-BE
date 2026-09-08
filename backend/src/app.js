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
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_ORIGINS || '').split(','),
  'http://localhost:5173',
  'http://localhost:5174',
  'https://new-pregnant-employees-o0eyh7d1f-ovindu0812s-projects.vercel.app',
].map((origin) => origin && origin.trim()).filter(Boolean);

if (process.env.NODE_ENV !== 'test') {
  console.log('Environment check:', {
    hasSupabaseUrl: Boolean(process.env.SUPABASE_URL),
    hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY),
    hasServiceRoleKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    frontendUrl: process.env.FRONTEND_URL || null,
    nodeEnv: process.env.NODE_ENV || null,
  });
}

app.disable('x-powered-by');
app.use(cors({
  origin: (origin, callback) => {
    // Non-browser requests (curl/Postman) have no Origin header.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    // Vite may move to another localhost port when 5173/5174 is occupied.
    // Keep development convenient while retaining an explicit allowlist in production.
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new ApiError(403, `CORS origin is not allowed: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '100kb' }));
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

app.get('/api/health', (req, res) => res.status(200).json({ success: true, message: 'SafeMum API is running' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/legal', legalRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
