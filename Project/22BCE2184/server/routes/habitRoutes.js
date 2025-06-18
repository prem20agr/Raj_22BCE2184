/**
 * Habit Routes - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: RESTful API endpoints for habit creation, management, and tracking
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const Habit = require('../models/Habit');
const HabitCompletion = require('../models/HabitCompletion');

const router = express.Router();

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Create a new habit
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name, description, category, color, icon,
      frequency, targetCount, unit, reminder
    } = req.body;

    // Validation
    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const newHabit = new Habit({
      userId: req.user.userId,
      name: name.trim(),
      description: description?.trim(),
      category,
      color: color || '#3B82F6',
      icon: icon || '🎯',
      frequency: frequency || { type: 'daily' },
      targetCount: targetCount || 1,
      unit: unit || 'times',
      reminder: reminder || { enabled: false }
    });

    await newHabit.save();

    res.status(201).json({
      message: 'Habit created successfully',
      habit: newHabit
    });
  } catch (error) {
    console.error('Habit creation error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to create habit' });
    }
  }
});

// Get habits for today with completion status
router.get('/today', authenticateToken, async (req, res) => {
  try {
    // Get today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get all active habits for the user
    const habits = await Habit.find({
      userId: req.user.userId,
      isActive: true
    }).sort({ createdAt: -1 });
    
    // Get all of today's completions for the user
    const todayCompletions = await HabitCompletion.find({
      userId: req.user.userId,
      date: today
    });
    
    // Map habits with their completion status
    const habitsWithCompletions = habits.map(habit => {
      const todayCompletion = todayCompletions.find(c => 
        c.habitId.toString() === habit._id.toString()
      );
      
      return {
        ...habit.toObject(),
        completedToday: todayCompletion?.completed || false,
        todayCompletedCount: todayCompletion?.completedCount || 0,
        completionId: todayCompletion?._id || null
      };
    });
    
    // Format response to match what the frontend expects
    res.json({
      habits: habitsWithCompletions,
      success: true,
      message: 'Habits retrieved successfully'
    });
  } catch (error) {
    console.error('Today\'s habits fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s habits' });
  }
});

// Get all habits for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    let filter = { userId: req.user.userId };
    
    if (category) {
      filter.category = category;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const habits = await Habit.find(filter)
      .sort({ createdAt: -1 });

    // Get today's completions for each habit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const habitsWithCompletions = await Promise.all(
      habits.map(async (habit) => {
        const todayCompletion = await HabitCompletion.findOne({
          userId: req.user.userId,
          habitId: habit._id,
          date: today
        });

        return {
          ...habit.toObject(),
          completedToday: todayCompletion?.completed || false,
          todayCompletedCount: todayCompletion?.completedCount || 0
        };
      })
    );

    res.json(habitsWithCompletions);
  } catch (error) {
    console.error('Habits fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// Get a specific habit
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Get recent completions
    const recentCompletions = await HabitCompletion.find({
      habitId: habit._id,
      userId: req.user.userId
    })
    .sort({ date: -1 })
    .limit(30);

    res.json({
      habit,
      recentCompletions
    });
  } catch (error) {
    console.error('Habit fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch habit' });
  }
});

// Update a habit
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const allowedUpdates = [
      'name', 'description', 'category', 'color', 'icon',
      'frequency', 'targetCount', 'unit', 'reminder', 'isActive'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    // Trim string fields
    if (updates.name) updates.name = updates.name.trim();
    if (updates.description) updates.description = updates.description.trim();

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    res.json({
      message: 'Habit updated successfully',
      habit
    });
  } catch (error) {
    console.error('Habit update error:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to update habit' });
    }
  }
});

// Delete a habit
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Optional: Also delete all completions for this habit
    await HabitCompletion.deleteMany({
      habitId: req.params.id,
      userId: req.user.userId
    });

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Habit deletion error:', error);
    res.status(500).json({ error: 'Failed to delete habit' });
  }
});



// Get habit statistics
router.get('/:id/stats', authenticateToken, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const habit = await Habit.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Get completions in the specified period
    const completions = await HabitCompletion.find({
      habitId: req.params.id,
      userId: req.user.userId,
      date: { $gte: startDate, $lte: endDate }
    }).sort({ date: 1 });

    // Calculate statistics
    const totalDays = days;
    const completedDays = completions.filter(c => c.completed).length;
    const completionRate = totalDays > 0 ? (completedDays / totalDays) * 100 : 0;
    
    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i >= -days; i--) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() + i);
      
      const completion = completions.find(c => 
        c.date.getTime() === checkDate.getTime()
      );
      
      if (completion && completion.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    res.json({
      habit: {
        name: habit.name,
        category: habit.category,
        targetCount: habit.targetCount,
        unit: habit.unit
      },
      period: `${days} days`,
      statistics: {
        totalDays,
        completedDays,
        completionRate: Math.round(completionRate * 100) / 100,
        currentStreak,
        longestStreak: habit.longestStreak,
        totalCompletions: habit.totalCompletions
      },
      dailyCompletions: completions.map(c => ({
        date: c.date,
        completed: c.completed,
        completedCount: c.completedCount,
        notes: c.notes,
        mood: c.mood,
        difficulty: c.difficulty
      }))
    });
  } catch (error) {
    console.error('Habit stats error:', error);
    res.status(500).json({ error: 'Failed to fetch habit statistics' });
  }
});

module.exports = router;
