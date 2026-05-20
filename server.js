// server.js
const http = require('http');
const connectDB = require('./src/shared/configs/db');
const app = require('./src/app');
const { initSocket } = require('./src/shared/socket');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const start = async () => {
  await connectDB();
  initSocket(server);
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start();
