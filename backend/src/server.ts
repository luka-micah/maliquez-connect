import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { connectRedis } from './config/redis.js';
import { configureCloudinary } from './config/cloudinary.js';
import { initializeSocket } from './services/socketService.js';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();
    configureCloudinary();

    const httpServer = http.createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

startServer();
