const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const apiRoutes = require('./routes/api');
const { setupSockets } = require('./sockets/socketHandler');
const { seedInitialData } = require('./utils/seedData');

const app = express();
const server = http.createServer(app);

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Reasonable limit for active marketplace demo
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again shortly.' }
});
app.use('/api', limiter);

// Mount API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'AgriNex API Server',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.send('AgriNex Full-Stack Agricultural Marketplace API is running. Direct. Trusted. Smart.');
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An internal server error occurred'
  });
});

// Setup sockets
setupSockets(io);

// Server startup
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    // Seed initial dataset
    await seedInitialData();

    // Start Government of India Mandi Market Price scheduled background sync
    const marketPriceService = require('./services/marketPriceService');
    marketPriceService.startScheduledRefresh();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`====================================================`);
      console.log(`🌱 AgriNex API Server running on port ${PORT}`);
      console.log(`📡 Socket.IO Real-time Server active`);
      console.log(`🌾 Demo Data seeded: 4 roles ready (Farmer, Buyer, Transporter, Admin)`);
      console.log(`📊 Government of India Mandi Service (data.gov.in) initialized`);
      console.log(`====================================================`);
    });
  } catch (err) {
    console.error('Failed to start AgriNex server:', err);
  }
}

start();
