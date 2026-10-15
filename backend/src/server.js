import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(env.PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 CivicPulse Backend Server running on port ${env.PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🔗 API Base: ${env.BASE_URL}/api`);
      console.log(`🩺 Health: ${env.BASE_URL}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('[Startup Error] Failed to start server:', error.message);
    process.exit(1);
  }
};

const handleShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Closing server gracefully...`);
  if (server) {
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[Server] Uncaught Exception:', error);
  process.exit(1);
});

startServer();
