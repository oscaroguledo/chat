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
    const userId = socket.handshake.query.userId;
    socket.join(`user:${userId}`);
    logger.socket(`User ${userId} connected`, { socketId: socket.id, userId });

    socket.on('disconnect', () => {
        logger.socket(`User ${userId} disconnected`, { socketId: socket.id });
        
    });
    socket.on('private-message', (data) => {
        io.to(`user:${data.userId}`).emit('private-message', data);
        logger.socket(`Private message from user ${userId}`, { socketId: socket.id, data });
        
    });
    socket.on('group-message', (data) => {
        io.to(`group:${data.groupId}`).emit('group-message', data);
        logger.socket(`Group message from user ${userId}`, { socketId: socket.id, data });
        
    });
    socket.on('join-group', (data) => {
        socket.join(`group:${data.groupId}`);
        socket.to(`group:${data.groupId}`).emit('user-joined', { userId, groupId: data.groupId });
        logger.socket(`User ${userId} joined group`, { socketId: socket.id, data });
    });
    socket.on('leave-group', (data) => {
        socket.leave(`group:${data.groupId}`);
        socket.to(`group:${data.groupId}`).emit('user-left', { userId, groupId: data.groupId });
        logger.socket(`User ${userId} left group`, { socketId: socket.id, data });
    });
    socket.on('admin-action', (data) => {
        logger.socket(`User ${userId} performed admin action`, { socketId: socket.id, data });
    });
    socket.on('mute-user', (data) => {
        logger.socket(`User ${userId} muted user`, { socketId: socket.id, data });
    });
    socket.on('typing', (data) => {
        logger.socket(`User ${userId} is typing`, { socketId: socket.id, data });
    });
    socket.on('presence', (data) => {
        logger.socket(`User ${userId} sent presence`, { socketId: socket.id, data });
    });
    socket.on('notification', (data) => {
        logger.socket(`User ${userId} sent notification`, { socketId: socket.id, data });
    });
});
// ─── Middleware ───────────────────────────────
app.use(express.json());

app.use('/health', healthRoutes);

server.listen(config.port, () => {
  logger.server(`Server running at http://${config.host}:${config.port}`);
});