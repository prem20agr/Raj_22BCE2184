/**
 * User Model - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: MongoDB schema for user accounts with profile and preferences
 */

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String },
  timezone: { type: String, default: 'Asia/Kolkata' },
  preferences: {
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    notifications: { type: Boolean, default: true },
    weekStartsOn: { type: String, enum: ['Sunday', 'Monday'], default: 'Monday' }
  },
  streakGoals: {
    daily: { type: Number, default: 3 },
    weekly: { type: Number, default: 21 },
    monthly: { type: Number, default: 90 }
  },
  totalHabitsCompleted: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  joinedDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", userSchema);
