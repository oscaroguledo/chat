// server.js
const express = require('express');
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

app.listen(config.port, () => {
  console.log(`Server running at http://${config.host}:${config.port}`);
});