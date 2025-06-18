/**
 * Habit Completion Routes - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: RESTful API endpoints for habit completion tracking and analytics
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const HabitCompletion = require('../models/HabitCompletion');
const Habit = require('../models/Habit');

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

// Helper function to get start of day
const getStartOfDay = (date = new Date()) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  return startOfDay;
};

// Mark habit as completed for today
router.post('/complete', authenticateToken, async (req, res) => {
  try {
    const { habitId, completedCount = 1, notes, mood, difficulty, timeSpent } = req.body;

    if (!habitId) {
      return res.status(400).json({ error: 'Habit ID is required' });
    }

    // Verify habit belongs to user
    const habit = await Habit.findOne({
      _id: habitId,
      userId: req.user.userId,
      isActive: true
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    const today = getStartOfDay();

    // Check if already completed for today
    let completion = await HabitCompletion.findOne({
      userId: req.user.userId,
      habitId,
      date: today
    });

    if (completion) {
      // Update existing completion
      completion.completed = true;
      completion.completedCount = Math.max(completion.completedCount, completedCount);
      completion.notes = notes || completion.notes;
      completion.mood = mood || completion.mood;
      completion.difficulty = difficulty || completion.difficulty;
      completion.timeSpent = timeSpent || completion.timeSpent;
      completion.completedAt = new Date();
    } else {
      // Create new completion
      completion = new HabitCompletion({
        userId: req.user.userId,
        habitId,
        date: today,
        completed: true,
        completedCount,
        notes,
        mood: mood || 'neutral',
        difficulty: difficulty || 3,
        timeSpent,
        completedAt: new Date()
      });
    }

    await completion.save();

    // Update habit statistics
    await updateHabitStats(habitId, req.user.userId);

    res.json({
      message: 'Habit marked as completed',
      completion
    });
  } catch (error) {
    console.error('Habit completion error:', error);
    res.status(500).json({ error: 'Failed to mark habit as completed' });
  }
});

// Undo habit completion for today
router.post('/uncomplete', authenticateToken, async (req, res) => {
  try {
    const { habitId } = req.body;

    if (!habitId) {
      return res.status(400).json({ error: 'Habit ID is required' });
    }

    const today = getStartOfDay();

    const completion = await HabitCompletion.findOneAndUpdate(
      {
        userId: req.user.userId,
        habitId,
        date: today
      },
      {
        completed: false,
        completedCount: 0,
        completedAt: null
      },
      { new: true }
    );

    if (!completion) {
      return res.status(404).json({ error: 'No completion found for today' });
    }

    // Update habit statistics
    await updateHabitStats(habitId, req.user.userId);

    res.json({
      message: 'Habit completion undone',
      completion
    });
  } catch (error) {
    console.error('Habit uncompletion error:', error);
    res.status(500).json({ error: 'Failed to undo habit completion' });
  }
});

// Get completions for a specific date range
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, habitId } = req.query;

    let filter = { userId: req.user.userId };

    if (habitId) {
      filter.habitId = habitId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        filter.date.$gte = getStartOfDay(new Date(startDate));
      }
      if (endDate) {
        filter.date.$lte = getStartOfDay(new Date(endDate));
      }
    }

    const completions = await HabitCompletion.find(filter)
      .populate('habitId', 'name category color icon unit targetCount')
      .sort({ date: -1 });

    res.json(completions);
  } catch (error) {
    console.error('Completion history error:', error);
    res.status(500).json({ error: 'Failed to fetch completion history' });
  }
});

// Get today's completions
router.get('/today', authenticateToken, async (req, res) => {
  try {
    const today = getStartOfDay();

    const completions = await HabitCompletion.find({
      userId: req.user.userId,
      date: today
    }).populate('habitId', 'name category color icon unit targetCount');

    res.json(completions);
  } catch (error) {
    console.error('Today completions error:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s completions' });
  }
});

// Get weekly progress
router.get('/weekly', authenticateToken, async (req, res) => {
  try {
    const { weekOffset = 0 } = req.query;
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const completions = await HabitCompletion.find({
      userId: req.user.userId,
      date: { $gte: startOfWeek, $lte: endOfWeek }
    }).populate('habitId', 'name category color icon');

    // Group by day of week
    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      
      const dayCompletions = completions.filter(c => 
        c.date.toDateString() === currentDay.toDateString()
      );

      weeklyData.push({
        date: currentDay,
        dayName: currentDay.toLocaleDateString('en-US', { weekday: 'short' }),
        completions: dayCompletions,
        totalCompleted: dayCompletions.filter(c => c.completed).length,
        totalHabits: dayCompletions.length
      });
    }

    res.json({
      weekPeriod: {
        start: startOfWeek,
        end: endOfWeek
      },
      weeklyData
    });
  } catch (error) {
    console.error('Weekly progress error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly progress' });
  }
});

// Get overall statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const days = parseInt(req.query.days || '30');
    console.log('Stats requested for last', days, 'days'); // Debug log
    
    // Get date range
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999); // End of today
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0); // Start of the day, X days ago
    
    // Get user stats
    const stats = await HabitCompletion.getUserStats(req.user.userId, startDate, endDate);
    console.log('Raw stats from getUserStats:', stats); // Debug log

    // Get current streak across all habits
    let currentGlobalStreak = 0;
    
    for (let i = 0; i >= -days; i--) {
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() + i);
      checkDate.setHours(0, 0, 0, 0);
      
      const dayCompletions = await HabitCompletion.find({
        userId: req.user.userId,
        date: {
          $gte: checkDate,
          $lt: new Date(checkDate.getTime() + 24 * 60 * 60 * 1000)
        },
        completed: true
      });
      
      if (dayCompletions.length > 0) {
        if (i <= 0) currentGlobalStreak++; // Only count streak for today and past days
      } else if (i < 0) { // Only break streak for past days, not today
        break;
      }
    }
    
    // Count active habits
    const totalHabits = await mongoose.model('Habit').countDocuments({ 
      userId: req.user.userId,
      isActive: true
    });
    
    // Count completions for today
    const today = getStartOfDay();
    const completedToday = await HabitCompletion.countDocuments({
      userId: req.user.userId,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      },
      completed: true
    });
    
    // Calculate completion rate
    const totalCompletions = stats.totalCompletions || 0;
    const totalAttempts = stats.totalAttempts || 0;
    const completionRate = totalAttempts > 0 
      ? Math.round((totalCompletions / totalAttempts) * 100) 
      : 0;
    
    // Get longest streak from all habits
    const habits = await mongoose.model('Habit').find({
      userId: req.user.userId
    }).sort({ longestStreak: -1 }).limit(1);
    
    const longestStreak = habits.length > 0 ? (habits[0].longestStreak || 0) : 0;
    
    // Create a flat data structure with all necessary fields
    const responseData = {
      // Basic stats
      totalHabits,
      completedToday,
      totalCompletions,
      totalAttempts,
      
      // Streak data
      currentStreak: currentGlobalStreak,
      longestStreak,
      currentGlobalStreak, // duplicate for compatibility
      
      // Rates
      completionRate,
      averageMood: stats.averageMood || 0,
      averageDifficulty: stats.averageDifficulty || 0,
      
      // Control fields
      success: true,
      message: 'Stats retrieved successfully'
    };
    
    console.log('Sending stats response:', responseData); // Debug log
    res.json(responseData);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Helper function to update habit statistics
async function updateHabitStats(habitId, userId) {
  try {
    const completions = await HabitCompletion.find({
      habitId,
      userId,
      completed: true
    }).sort({ date: -1 });

    const totalCompletions = completions.length;
    
    // Calculate current streak
    let currentStreak = 0;
    const today = getStartOfDay();
    
    for (let i = 0; i >= -365; i--) { // Check up to a year back
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() + i);
      
      const completion = completions.find(c => 
        c.date.getTime() === checkDate.getTime()
      );
      
      if (completion) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let currentSequence = 0;
    
    const sortedDates = completions.map(c => c.date).sort((a, b) => a - b);
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        currentSequence = 1;
      } else {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = (currDate - prevDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 1) {
          currentSequence++;
        } else {
          longestStreak = Math.max(longestStreak, currentSequence);
          currentSequence = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, currentSequence);

    await Habit.findByIdAndUpdate(habitId, {
      totalCompletions,
      currentStreak,
      longestStreak,
      lastCompletedDate: completions.length > 0 ? completions[0].date : null
    });
  } catch (error) {
    console.error('Error updating habit stats:', error);
  }
}

// Get weekly progress for charts
router.get('/weekly-progress', authenticateToken, async (req, res) => {
  try {
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 6); // Last 7 days including today
    startDate.setHours(0, 0, 0, 0);
    
    // Get all habits for the user
    const habits = await mongoose.model('Habit').find({ 
      userId: req.user.userId,
      isActive: true
    });
    
    // Get all completions for the date range
    const completions = await HabitCompletion.find({
      userId: req.user.userId,
      date: { $gte: startDate, $lte: endDate },
      completed: true
    }).populate('habitId', 'name category color icon');
    
    // Process data into daily stats
    const dailyProgress = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Find completions for this day
      const dayCompletions = completions.filter(c => 
        c.date.toDateString() === currentDate.toDateString()
      );
      
      // Calculate completion rate
      const completionRate = habits.length > 0 
        ? Math.round((dayCompletions.length / habits.length) * 100) 
        : 0;
      
      dailyProgress.push({
        date: currentDate.toISOString().split('T')[0],
        dayName: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
        totalHabits: habits.length,
        completed: dayCompletions.length,
        completionRate
      });
    }
    
    res.json({
      progress: dailyProgress,
      success: true,
      message: 'Weekly progress retrieved successfully'
    });
  } catch (error) {
    console.error('Weekly progress error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly progress' });
  }
});

// Get calendar data for completion calendar
router.get('/calendar', authenticateToken, async (req, res) => {
  try {
    // Get start/end dates (default to last 90 days)
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);
    startDate.setHours(0, 0, 0, 0);
    
    // Get all habits for the user during this period
    const habits = await mongoose.model('Habit').find({ 
      userId: req.user.userId,
      $or: [
        { createdAt: { $lte: endDate } },
        { isActive: true }
      ]
    });
    
    // Get all completions grouped by date
    const completions = await HabitCompletion.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.userId),
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$completed', 1, 0] } }
        }
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          total: 1,
          completed: 1,
          completionRate: { 
            $multiply: [
              { $cond: [{ $eq: ['$total', 0] }, 0, { $divide: ['$completed', '$total'] }] },
              100
            ]
          }
        }
      }
    ]);
    
    res.json({
      completions,
      success: true,
      message: 'Calendar data retrieved successfully'
    });
  } catch (error) {
    console.error('Calendar data error:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});

module.exports = router;
