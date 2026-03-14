require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { startAppointmentChecker } = require('./utils/appointmentChecker');

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
connectDB().then(() => {
  startAppointmentChecker();
}).catch(console.error);

const app = express();
const server = http.createServer(app);

// Init Socket.io
initSocket(server);

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://172.20.10.2:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 1000, message: 'Too many requests, please try again later' });
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check & Ping
app.get('/health', (req, res) => res.json({ status: 'OK', app: 'TOQN - Mercy Salon', timestamp: new Date() }));
app.get('/api/ping', (req, res) => res.json({ ok: true }));

// API Routes
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

// VAPID public key endpoint for client subscription
app.get('/api/push/vapid-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  🚀 TOQN Server running on port ${PORT}
  📊 Health: http://localhost:${PORT}/health
  🌐 API: http://localhost:${PORT}/api
  🔧 Environment: ${process.env.NODE_ENV}
  `);
});
