const app = require('../src/app');
const { connectDb } = require('../src/config/db');

let dbConnectPromise = null;

async function ensureDbConnection() {
  if (!dbConnectPromise) {
    dbConnectPromise = connectDb().catch((error) => {
      dbConnectPromise = null;
      throw error;
    });
  }
  return dbConnectPromise;
}

module.exports = async (req, res) => {
  try {
    await ensureDbConnection();
    return app(req, res);
  } catch (error) {
    console.error('Serverless invocation failed:', error);
    return res.status(500).json({
      error: 'Server initialization failed',
      message: error.message
    });
  }
};
