// server.js
const express = require('express');
const { createServer } = require('http');
const config = require('@/core/config');
const healthRoutes = require('@/routes/health');
const { Server } = require('socket.io');
const logger = require('@/core/utils/logger');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // adjust in production
});
io.on("connection", (socket) => {
  logger.socket('User connected', { socketId: socket.id });

  socket.on('disconnect', () => {
    logger.socket('User disconnected', { socketId: socket.id });
  });
  socket.on('message', (data) => {
    logger.socket('Message received', { socketId: socket.id, data });
    // Emit to all clients including sender (for debugging)
    socket.broadcast.emit('message', data);
    // io.emit('message', data);
  });
  socket.on('join-group', (data) => {
    logger.socket('Join group', { socketId: socket.id, data });
  });
  socket.on('leave-group', (data) => {
    logger.socket('Leave group', { socketId: socket.id, data });
  });
  socket.on('admin-action', (data) => {
    logger.socket('Admin action', { socketId: socket.id, data });
  });
  socket.on('mute-user', (data) => {
    logger.socket('Mute user', { socketId: socket.id, data });
  });
  socket.on('typing', (data) => {
    logger.socket('Typing', { socketId: socket.id, data });
  });
  socket.on('presence', (data) => {
    logger.socket('Presence', { socketId: socket.id, data });
  });
  socket.on('notification', (data) => {
    logger.socket('Notification', { socketId: socket.id, data });
  });
});
// ─── Middleware ───────────────────────────────
app.use(express.json());

app.use('/health', healthRoutes);

server.listen(config.port, () => {
  logger.server(`Server running at http://${config.host}:${config.port}`);
});