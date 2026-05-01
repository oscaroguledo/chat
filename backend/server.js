// server.js
const express = require('express');
const { createServer } = require('http');
const config = require('@/core/config');
const healthRoutes = require('@/routes/health');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' } // adjust in production
});

// ─── Middleware ───────────────────────────────
app.use(express.json());

app.use('/health', healthRoutes);

server.listen(config.port, () => {
  console.log(`Server running at http://${config.host}:${config.port}`);
});