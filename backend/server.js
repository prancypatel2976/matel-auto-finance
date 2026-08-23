const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const Admin = require('./models/Admin');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Matel Auto Finance API Server Running' });
});

// 404 handler for unknown backend routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API Route Not Found' });
});

const PORT = process.env.PORT || 5000;

// Helper function to ensure default admin exists
const ensureAdminExists = async () => {
  try {
    const email = 'admin@matelauto.com';
    const existing = await Admin.findOne({ email });
    if (!existing) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      await Admin.create({
        name: 'Admin',
        email,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin seeded (admin@matelauto.com / Admin@123)');
    }
  } catch (err) {
    console.error('Error ensuring admin exists:', err.message);
  }
};

// Connect to Database first then start server
connectDB().then(async () => {
  await ensureAdminExists();
  app.listen(PORT, () => {
    console.log('=========================================');
    console.log(`🚀 Server is listening on Port ${PORT}`);
    console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
    console.log('=========================================');
  });
}).catch((err) => {
  console.error('Failed to start server due to DB connection failure:', err.message);
});

