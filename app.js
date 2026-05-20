require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const winston = require('winston');
const rateLimit = require('express-rate-limit');

// Import routes
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Configure Winston Logger
const logFormat = winston.format.printf(({ timestamp, level, message }) => {
  return `[${timestamp}] [${level.toUpperCase()}] [${message}]`;
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'app.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    })
  ]
});

// Make logger available in all requests
app.use((req, res, next) => {
  req.logger = logger;
  next();
});

// Morgan middleware for HTTP request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
}));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// ============ ROUTES - PASTIKAN INI ADA ============
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wallet', walletRoutes);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Test endpoint untuk cek server
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// 404 handler - letakkan di AKHIR sebelum error handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint not found: ${req.method} ${req.url}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`Server error: ${err.message}`);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 Logs are being saved to logs/ directory`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST   /api/v1/auth/register`);
  console.log(`   POST   /api/v1/auth/login`);
  console.log(`   GET    /api/v1/wallet/balance (protected)`);
  console.log(`   POST   /api/v1/wallet/topup (protected)`);
  console.log(`   POST   /api/v1/wallet/transfer (protected)\n`);
});

module.exports = { logger };