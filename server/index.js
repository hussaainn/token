require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const loyaltyRoutes = require('./routes/loyaltyRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const geoRoutes = require('./routes/geoRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const staffRoutes = require('./routes/staffRoutes');

// Connect DB
connectDB();

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Security Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// -----------------------------
// FIXED CORS CONFIG
// -----------------------------
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
];

// Allow local network devices (phones, tablets)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.startsWith('http://172.')
      ) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// -----------------------------
// Rate limiting
// -----------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests, please try again later',
});

app.use('/api', limiter);

// -----------------------------
// Body parsing
// -----------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// -----------------------------
// Health check
// -----------------------------
app.get('/health', (req, res) =>
  res.json({
    status: 'OK',
    app: 'TOQN - Mercy Salon',
    timestamp: new Date(),
  })
);

// -----------------------------
// API Routes
// -----------------------------
app.use('/api/auth', authRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/loyalty', loyaltyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/geo', geoRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/users/staff', staffRoutes);

// -----------------------------
// VAPID public key endpoint
// -----------------------------
app.get('/api/push/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// -----------------------------
// Error handling
// -----------------------------
app.use(notFound);
app.use(errorHandler);

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 TOQN Server running on port ${PORT}
📊 Health: http://localhost:${PORT}/health
🌐 API: http://localhost:${PORT}/api
📱 Mobile Access: http://192.168.29.13:${PORT}
🔧 Environment: ${process.env.NODE_ENV}
`);
});