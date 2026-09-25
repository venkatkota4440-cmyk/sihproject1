function setupSockets(io) {
  io.on('connection', (socket) => {
    // Join personal user room for targeted notifications
    socket.on('join:user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
      }
    });

    // Join order / negotiation room
    socket.on('join:order', (orderId) => {
      if (orderId) {
        socket.join(`order_${orderId}`);
      }
    });

    // Send real-time negotiation update
    socket.on('negotiation:update', (data) => {
      if (data.orderId) {
        io.to(`order_${data.orderId}`).emit('negotiation:changed', data);
      }
      if (data.targetUserId) {
        io.to(`user_${data.targetUserId}`).emit('notification:new', {
          title: 'Offer Updated',
          message: data.message,
          data
        });
      }
    });

    // Real-time Chat message
    socket.on('chat:send', (msgData) => {
      const room = `order_${msgData.orderId}`;
      io.to(room).emit('chat:received', msgData);

      if (msgData.receiverId) {
        io.to(`user_${msgData.receiverId}`).emit('chat:received', msgData);
      }
    });

    // Simulated Transporter GPS Telemetry Stream
    socket.on('tracking:subscribe', (orderId) => {
      socket.join(`tracking_${orderId}`);
    });

    socket.on('disconnect', () => {
      // Clean up
    });
  });

  // Simulated GPS Telemetry Interval (moves truck smoothly along Nashik-Mumbai route)
  let routeProgress = 0.45;
  let direction = 1;

  setInterval(() => {
    // Route from Nashik [20.076, 74.108] to Mumbai [19.076, 73.003]
    routeProgress += 0.01 * direction;
    if (routeProgress >= 0.95) direction = -1;
    if (routeProgress <= 0.05) direction = 1;

    const lat = 20.076 - (20.076 - 19.076) * routeProgress;
    const lng = 74.108 - (74.108 - 73.003) * routeProgress;

    const telemetry = {
      orderId: 'order_demo_301',
      coordinates: [+lat.toFixed(5), +lng.toFixed(5)],
      speedKmH: Math.floor(48 + Math.random() * 8),
      etaMinutes: Math.max(15, Math.floor(120 * (1 - routeProgress))),
      distanceRemainingKm: Math.max(10, Math.floor(165 * (1 - routeProgress))),
      temperatureCelsius: +(17.8 + Math.random() * 0.6).toFixed(1),
      timestamp: new Date().toISOString()
    };

    io.to('tracking_order_demo_301').emit('tracking:telemetry', telemetry);
    io.emit('telemetry:broadcast', telemetry);
  }, 4000);
}

module.exports = { setupSockets };
