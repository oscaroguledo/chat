// server.js
const express = require('express');
const config = require('./core/config');
const healthRoutes = require('./routes/health');
const app = express();

app.use('/health', healthRoutes);

app.listen(config.port, () => {
  console.log(`Server running at http://${config.host}:${config.port}`);
});