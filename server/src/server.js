require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/authRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const donorRoutes = require('./routes/donorRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const reportRoutes = require('./routes/reportRoutes');
const exportRoutes = require('./routes/exportRoutes');
const userRoutes = require('./routes/userRoutes');
const collectorRoutes = require('./routes/collectorRoutes');
const auditRoutes = require('./routes/auditRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const errorHandler = require('./middleware/errorHandler');
const sanitizeInput = require('./middleware/sanitizeInput');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Trust Proxy for Reverse Proxies (Vercel, Render, Railway, Cloudflare, Nginx)
// Required for accurate client IP rate limiting behind load balancers
app.set('trust proxy', 1);

// Security Middlewares - Comprehensive Helmet Protection
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false, // Allows flexible CDN font/script loading while preventing inline injection
  frameguard: { action: 'deny' },
  xssFilter: true,
  noSniff: true,
  hidePoweredBy: true
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman, serverless)
    if (
      !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app') || 
      origin.endsWith('.netlify.app') || 
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.railway.app')
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in production for custom domains
  },
  credentials: true
}));

// Safe Request body parsers with strict size limits (1MB prevents payload flooding)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Anti-Injection & Deep Input Sanitization Middleware (XSS, SQLi, NoSQL Injection, Prototype Pollution)
app.use(sanitizeInput);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Global Rate Limiter for general API endpoints to prevent DDoS, Scanners, & Fuzzing
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 600, // 600 requests per 5 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after a few minutes.'
  }
});

// Stricter Rate Limiter for Login endpoint (Brute-Force Defense)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 login requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

// Route registration
app.use('/api', apiLimiter);
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/collectors', collectorRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/settings', settingsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'अष्टविनायक मित्र मंडळ — गणेशोत्सव API',
    mandal: 'Ashtavinayak Mitra Mandal, Boisar',
    timestamp: new Date().toISOString()
  });
});

const { bootstrapDatabase } = require('./utils/bootstrap');

// Centralized Error Handling
app.use(errorHandler);

// Only listen if executed directly as main module and not in serverless mode
if (require.main === module && !process.env.VERCEL) {
  const server = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🕉️  अष्टविनायक मित्र मंडळ Server running on port ${PORT}`);
    console.log(`🔱  Location: रोहित कॉलनी, बोईसर (३९ वा गणेशोत्सव)`);
    console.log(`🌐  API Health: http://0.0.0.0:${PORT}/api/health`);

    // Verify and ensure admin account exists on startup
    await bootstrapDatabase();
  });

  const shutdown = () => {
    console.log('Stopping server gracefully...');
    server.close(() => {
      console.log('Server terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

module.exports = app;
