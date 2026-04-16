// server.js
const connectDB = require('./src/shared/configs/db');
const app = require('./src/app');
// const { connectDB } = require('./src/shared/config/db');
require('dotenv').config();

const PORT = process.env.PORT 

const start = async () => {
  await connectDB();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start();