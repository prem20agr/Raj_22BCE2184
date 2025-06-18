/**
 * Habit Model - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: MongoDB schema for habit definitions with categories and settings
 */

const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: { 
    type: String, 
    enum: ['Health', 'Fitness', 'Productivity', 'Learning', 'Mindfulness', 'Social', 'Creative', 'Other'], 
    required: true 
  },
  color: { 
    type: String, 
    default: '#3B82F6',
    validate: {
      validator: function(v) {
        return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
      },
      message: 'Color must be a valid hex color code'
    }
  },
  icon: { type: String, default: '🎯' },
  frequency: {
    type: { type: String, enum: ['daily', 'weekly', 'custom'], default: 'daily' },
    weeklyDays: [{ type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] }],
    customDays: [{ type: Date }]
  },
  targetCount: { type: Number, default: 1, min: 1 },
  unit: { type: String, default: 'times' }, // e.g., 'minutes', 'pages', 'glasses', 'times'
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  // Statistics
  totalCompletions: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCompletedDate: { type: Date },
  // Reminders
  reminder: {
    enabled: { type: Boolean, default: false },
    time: { type: String }, // Format: "HH:MM"
    message: { type: String }
  }
});

// Index for faster queries
habitSchema.index({ userId: 1, isActive: 1 });
habitSchema.index({ userId: 1, createdAt: -1 });

// Update the updatedAt field before saving
habitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Habit", habitSchema);
