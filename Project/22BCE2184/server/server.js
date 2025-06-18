/**
 * HabitFlow Personal Habit Tracking System - Backend Server
 * 
 * A comprehensive personal development platform designed to help individuals 
 * build sustainable habits, track their progress, and achieve their wellness goals.
 * 
 * @author Raj Agarwal <raj.agarwal@habitflow.app>
 * @version 2.0.0
 * @license MIT
 */

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Import routes with new names
const userRoutes = require('./routes/userRoutes');
const habitRoutes = require('./routes/habitRoutes');
const habitCompletionRoutes = require('./routes/habitCompletionRoutes');

const app = express();

// Rate limiting configuration
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://habitflow.app',
    'https://www.habitflow.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Security headers
app.use('/api/', (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HabitFlow API is running successfully',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    author: 'Raj Agarwal'
  });
});

// API Routes v1
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/habits', habitRoutes);
app.use('/api/v1/completions', habitCompletionRoutes);

// API information endpoint
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'HabitFlow API',
    version: '2.0.0',
    description: 'Personal Habit Tracking and Wellness Management System',
    author: 'Raj Agarwal',
    endpoints: {
      users: '/api/v1/users',
      habits: '/api/v1/habits',
      completions: '/api/v1/completions'
    },
    documentation: 'https://api.habitflow.app/docs'
  });
});

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint Not Found',
    message: `Route ${req.originalUrl} not found in HabitFlow API`,
    availableRoutes: [
      '/api/v1/users',
      '/api/v1/habits', 
      '/api/v1/completions',
      '/health'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Server Error:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: errors
    });
  }
  
  // JWT error
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Authentication Error',
      message: 'Invalid or expired token'
    });
  }
  
  // MongoDB duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      error: 'Duplicate Entry',
      message: `${field} already exists in the system`
    });
  }
  
  // Default server error
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    // Use environment variable or fallback to local MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitflow';
    
    const conn = await mongoose.connect(mongoURI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('💡 Tip: Make sure MongoDB is running locally or set MONGODB_URI in your .env file');
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log('\n🎯 ================================');
      console.log('   HabitFlow API Server Started');
      console.log('================================');
      console.log(`🚀 Server: http://localhost:${PORT}`);
      console.log(`💊 Health: http://localhost:${PORT}/health`);
      console.log(`📡 API v1: http://localhost:${PORT}/api/v1`);
      console.log(`👨‍💻 Author: Raj Agarwal`);
      console.log(`📅 Started: ${new Date().toLocaleString()}`);
      console.log('================================\n');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;
