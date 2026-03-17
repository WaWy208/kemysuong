const app = require('./app');
const env = require('./config/env');
const { connectDb, stopInMemoryMongo } = require('./config/db');
const mongoose = require('mongoose');

async function bootstrap() {
  await connectDb();

  const server = app.listen(env.port, () => {
    console.log(`KEM Ý SƯƠNG API running at http://localhost:${env.port}`);
  });

  server.requestTimeout = 30000;
  server.headersTimeout = 35000;
  server.keepAliveTimeout = 5000;

  const shutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    try {
      await new Promise((resolve) => server.close(resolve));
      await mongoose.connection.close(false);
      await stopInMemoryMongo();
      console.log('Shutdown completed.');
      process.exit(0);
    } catch (error) {
      console.error('Shutdown error:', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
