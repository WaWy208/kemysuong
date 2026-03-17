const mongoose = require('mongoose');
const env = require('./env');

let inMemoryServer = null;

async function startInMemoryMongo() {
  if (inMemoryServer) return inMemoryServer.getUri();

  const { MongoMemoryServer } = require('mongodb-memory-server');
  inMemoryServer = await MongoMemoryServer.create();
  const uri = inMemoryServer.getUri();
  console.warn(`[db] Using in-memory MongoDB at ${uri}`);
  return uri;
}

async function connectDb(options = {}) {
  const isProduction = env.nodeEnv === 'production';
  const retries = Number(options.retries ?? (isProduction ? 10 : 2));
  const delayMs = Number(options.delayMs ?? (isProduction ? 2000 : 400));
  mongoose.set('strictQuery', true);
  let lastError;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await mongoose.connect(env.mongoUri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000
      });
      console.log(`MongoDB connected (attempt ${attempt}/${retries})`);
      return;
    } catch (error) {
      lastError = error;
      const shouldRetry = attempt < retries;
      console.error(`MongoDB connection failed (attempt ${attempt}/${retries}): ${error.message}`);
      if (!shouldRetry) break;
      const wait = delayMs * attempt;
      await new Promise((resolve) => setTimeout(resolve, wait));
    }
  }

  const shouldUseInMemory = env.nodeEnv !== 'production';
  if (!shouldUseInMemory) throw lastError;

  console.warn('[db] Falling back to in-memory MongoDB because primary connection failed.');
  const uri = await startInMemoryMongo();
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 8000,
    socketTimeoutMS: 45000
  });
  console.log('MongoDB connected (in-memory fallback)');
}

async function stopInMemoryMongo() {
  if (!inMemoryServer) return;
  await inMemoryServer.stop();
  inMemoryServer = null;
}

module.exports = { connectDb, stopInMemoryMongo };
