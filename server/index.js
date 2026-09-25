const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { setupSockets } = require('./sockets/socketHandler');
const { seedInitialData } = require('./utils/seedData');

const server = http.createServer(app);

// Socket.io initialization with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
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

if (require.main === module) {
  start();
}

module.exports = { app, server };
