const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const { testConnection } = require('./config/db');
const { uploadDir } = require('./middleware/upload');

// Import route modules
const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const branchesRoutes = require('./routes/branches');
const inquiriesRoutes = require('./routes/inquiries');
const galleryRoutes = require('./routes/gallery');
const bannersRoutes = require('./routes/banners');
const faqsRoutes = require('./routes/faqs');
const uploadRoutes = require('./routes/upload');
const statsRoutes = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS setup
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:3001')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all in dev/staging to avoid blocking
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Request logger in development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[${req.method}] ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    });
    next();
  });
}

// Serve uploaded static files
app.use('/uploads', express.static(uploadDir, {
  maxAge: '7d',
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  return res.json({
    status: 'ok',
    service: 'faring-backend',
    timestamp: new Date().toISOString(),
    database: dbStatus.connected ? 'connected' : 'error',
    dbDetails: dbStatus.connected ? { time: dbStatus.timestamp } : { error: dbStatus.error },
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/branches', branchesRoutes);
app.use('/api/inquiries', inquiriesRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/banners', bannersRoutes);
app.use('/api/faqs', faqsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
const server = app.listen(PORT, async () => {
  console.log(`===============================================`);
  console.log(`🚀 Nature Farming Backend Server running on port ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`📁 Static Uploads: http://localhost:${PORT}/uploads`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`===============================================`);

  // Test DB connection on startup
  const dbHealth = await testConnection();
  if (dbHealth.connected) {
    console.log(`✅ PostgreSQL Connected successfully. (DB Time: ${dbHealth.timestamp})`);
  } else {
    console.warn(`⚠️ PostgreSQL Connection Warning: ${dbHealth.error}`);
    console.warn(`👉 Make sure PostgreSQL is running and DATABASE_URL is configured in backend/.env`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
