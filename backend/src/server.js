require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const setupSocket = require('./sockets');

const app = express();
const server = http.createServer(app);
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// ── Global Middleware ──
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global rate limiter
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, error: 'Too many requests' },
}));

// Make io accessible in routes
app.set('io', io);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'traveloop-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── API Routes ──
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/trips/:tripId/stops', require('./routes/stops'));
app.use('/api/stops/:stopId/activities', require('./routes/activities'));
app.use('/api/trips/:tripId/budget', require('./routes/budget'));
app.use('/api/trips/:tripId/checklist', require('./routes/checklist'));
app.use('/api/trips/:tripId/notes', require('./routes/notes'));
app.use('/api/search', require('./routes/search'));
app.use('/api/social', require('./routes/social'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/ai', require('./routes/ai'));

// ── 404 handler ──
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// ── Error handler ──
app.use(errorHandler);

// ── Socket.io ──
setupSocket(io);

// ── Start Server ──
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║     🧳  TRAVELOOP BACKEND  🧳           ║
  ║                                          ║
  ║   Server:  http://localhost:${PORT}         ║
  ║   Env:     ${process.env.NODE_ENV || 'development'}               ║
  ║   Socket:  ws://localhost:${PORT}           ║
  ╚══════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };
