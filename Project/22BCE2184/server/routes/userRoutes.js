/**
 * User Routes - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: RESTful API endpoints for user authentication and management
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  console.log('Authenticating token...');
  
  const authHeader = req.headers['authorization'];
  console.log('Auth header:', authHeader ? 'Present' : 'Missing');
  
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }
  
  console.log('Token found, verifying...');
  
  try {
    // Use synchronous verify to catch errors directly
    const user = jwt.verify(token, JWT_SECRET);
    console.log('Token verified successfully for user:', user.username);
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token', details: err.message });
  }
};

// User Registration
router.post('/register', authLimiter, async (req, res) => {
  try {
    const {
      firstname, lastname, email, username, password,
      timezone, preferences, streakGoals
    } = req.body;

    // Validation
    if (!firstname || !lastname || !email || !username || !password) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new User({
      firstname,
      lastname,
      email,
      username,
      password: hashedPassword,
      timezone: timezone || 'Asia/Kolkata',
      preferences: preferences || {},
      streakGoals: streakGoals || {}
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        firstname: newUser.firstname,
        lastname: newUser.lastname,
        email: newUser.email,
        username: newUser.username,
        timezone: newUser.timezone,
        preferences: newUser.preferences,
        streakGoals: newUser.streakGoals,
        totalHabitsCompleted: newUser.totalHabitsCompleted,
        currentStreak: newUser.currentStreak,
        longestStreak: newUser.longestStreak,
        joinedDate: newUser.joinedDate
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// User Login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
      isActive: true
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        username: user.username,
        timezone: user.timezone,
        preferences: user.preferences,
        streakGoals: user.streakGoals,
        totalHabitsCompleted: user.totalHabitsCompleted,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        joinedDate: user.joinedDate
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const allowedUpdates = [
      'firstname', 'lastname', 'email', 'timezone', 
      'preferences', 'streakGoals', 'profileImage'
    ];
    const updates = {};

    // Filter allowed updates
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Profile update error:', error);
    if (error.code === 11000) {
      res.status(400).json({ error: 'Email already in use' });
    } else {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
  console.log('Password change request received');
  console.log('Request body:', JSON.stringify(req.body));
  console.log('User ID from token:', req.user.userId);
  
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      console.log('Missing required fields');
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Find user
    const user = await User.findById(req.user.userId);
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ error: 'User not found' });
    }
    console.log('User found:', user.username);
    
    // Verify current password
    console.log('Verifying current password...');
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      console.log('Current password validation failed');
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    console.log('Current password verified successfully');
    
    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    console.log('New password hashed successfully');
    
    // Update password
    user.password = hashedPassword;
    await user.save();
    console.log('User password updated successfully in database');
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password', message: error.message });
  }
});

// Deactivate user account
router.put('/deactivate', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Account deactivation error:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
});

// Delete user account (legacy - keeping for backwards compatibility)
router.delete('/account', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Account deactivated successfully' });
  } catch (error) {
    console.error('Account deletion error:', error);
    res.status(500).json({ error: 'Failed to deactivate account' });
  }
});

module.exports = router;
