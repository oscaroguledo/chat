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
});
// ─── Middleware ───────────────────────────────
app.use(express.json());

app.use('/health', healthRoutes);

server.listen(config.port, () => {
  logger.server(`Server running at http://${config.host}:${config.port}`);
});