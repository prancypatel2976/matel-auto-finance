const mongoose = require('mongoose');
const dns = require('dns');

// Ensure reliable DNS resolution for MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const connectDB = async () => {
  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/matel_auto_finance';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log('✓ Database connected');
    return conn;
  } catch (error) {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        binary: { version: '5.0.28' }
      });
      const fallbackUri = mongod.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log('✓ Database connected');
      return conn;
    } catch (fallbackError) {
      console.error(`MongoDB fallback connection error: ${fallbackError.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

