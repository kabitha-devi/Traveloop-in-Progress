const { verifyAccessToken } = require('../utils/jwt');

function setupSocket(io) {
  // Auth middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId}`);

    // ── Join trip room for real-time collaboration ──
    socket.on('join:trip', (tripId) => {
      socket.join(`trip:${tripId}`);
      socket.to(`trip:${tripId}`).emit('user:joined', {
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });
      console.log(`User ${socket.userId} joined trip:${tripId}`);
    });

    socket.on('leave:trip', (tripId) => {
      socket.leave(`trip:${tripId}`);
      socket.to(`trip:${tripId}`).emit('user:left', {
        userId: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // ── Live itinerary updates ──
    socket.on('itinerary:update', (data) => {
      socket.to(`trip:${data.tripId}`).emit('itinerary:updated', {
        ...data,
        updatedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('activity:add', (data) => {
      socket.to(`trip:${data.tripId}`).emit('activity:added', {
        ...data,
        addedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('activity:reorder', (data) => {
      socket.to(`trip:${data.tripId}`).emit('activity:reordered', {
        ...data,
        reorderedBy: socket.userId,
        timestamp: new Date().toISOString(),
      });
    });

    // ── Live mode: share current location/status ──
    socket.on('live:location', (data) => {
      socket.to(`trip:${data.tripId}`).emit('live:location', {
        userId: socket.userId,
        lat: data.lat,
        lng: data.lng,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('live:checkin', (data) => {
      io.to(`trip:${data.tripId}`).emit('live:checkin', {
        userId: socket.userId,
        activityId: data.activityId,
        activityName: data.activityName,
        timestamp: new Date().toISOString(),
      });
    });

    // ── Group voting ──
    socket.on('vote:cast', (data) => {
      io.to(`trip:${data.tripId}`).emit('vote:update', {
        proposalId: data.proposalId,
        userId: socket.userId,
        value: data.value,
        timestamp: new Date().toISOString(),
      });
    });

    // ── Chat within trip ──
    socket.on('chat:message', (data) => {
      io.to(`trip:${data.tripId}`).emit('chat:message', {
        userId: socket.userId,
        message: data.message,
        timestamp: new Date().toISOString(),
      });
    });

    // ── Emergency SOS broadcast ──
    socket.on('emergency:sos', (data) => {
      io.to(`trip:${data.tripId}`).emit('emergency:alert', {
        userId: socket.userId,
        lat: data.lat,
        lng: data.lng,
        message: data.message || 'SOS — Emergency help needed!',
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.userId}`);
    });
  });
}

module.exports = setupSocket;
