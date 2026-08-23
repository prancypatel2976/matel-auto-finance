const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

dotenv.config({ path: path.join(__dirname, '../.env') });

const Admin = require('../models/Admin');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/matel_auto_finance';
    
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('MongoDB connected successfully for seeding admin...');
    } catch (err) {
      console.warn('Primary MongoDB connection failed. Using MongoMemoryServer for seed...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        binary: { version: '5.0.28' }
      });
      await mongoose.connect(mongod.getUri());
      console.log('MongoDB connected successfully (In-Memory Fallback)...');
    }

    const email = 'admin@matelauto.com';
    const rawPassword = 'Admin@123';

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });

    if (existingAdmin) {
      console.log('Admin already exists.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    // Create new Admin
    await Admin.create({
      name: 'Admin',
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin created successfully.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();

