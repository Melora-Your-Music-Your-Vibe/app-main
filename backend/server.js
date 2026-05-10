require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { connectDB, sequelize } = require('./src/config/db');
require('./src/config/passport');
const passport = require('passport');
const errorHandler = require('./src/middlewares/errorHandler');

// Import routes
const authRoutes = require('./src/routes/authRoutes');
const songRoutes = require('./src/routes/songRoutes');
const playlistRoutes = require('./src/routes/playlistRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const favoriteRoutes = require('./src/routes/favoriteRoutes');
const recentlyPlayedRoutes = require('./src/routes/recentlyPlayedRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: { success: false, message: 'Too many requests' } });
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Passport
app.use(passport.initialize());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Melora API is running 🎵', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/songs', songRoutes);
app.use('/api/v1/playlists', playlistRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/recently-played', recentlyPlayedRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  // Sync database (use { alter: true } in dev, { force: false } in prod)
  await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  console.log('✅ Database synced');

  app.listen(PORT, () => {
    console.log(`\n🎵 Melora API running on port ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
  });
};

startServer().catch(console.error);

module.exports = app;
