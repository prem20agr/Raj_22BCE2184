/**
 * HabitCompletion Model - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: MongoDB schema for tracking daily habit completions and progress
 */

const mongoose = require("mongoose");

const habitCompletionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  habitId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Habit', 
    required: true 
  },
  date: { 
    type: Date, 
    required: true,
    validate: {
      validator: function(v) {
        // Ensure date is set to beginning of day (00:00:00)
        const startOfDay = new Date(v);
        startOfDay.setHours(0, 0, 0, 0);
        return v.getTime() === startOfDay.getTime();
      },
      message: 'Date must be set to beginning of day'
    }
  },
  completed: { type: Boolean, default: false },
  completedCount: { type: Number, default: 0 }, // How many times completed (for habits with targetCount > 1)
  notes: { type: String, trim: true },
  completedAt: { type: Date },
  mood: { 
    type: String, 
    enum: ['excellent', 'good', 'neutral', 'difficult', 'struggled'],
    default: 'neutral'
  },
  difficulty: { 
    type: Number, 
    min: 1, 
    max: 5, 
    default: 3 
  }, // 1 = Very Easy, 5 = Very Hard
  timeSpent: { type: Number }, // in minutes
  streakAtCompletion: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index to ensure one completion per habit per day per user
habitCompletionSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

// Other useful indexes
habitCompletionSchema.index({ userId: 1, date: -1 });
habitCompletionSchema.index({ habitId: 1, date: -1 });
habitCompletionSchema.index({ userId: 1, completed: 1, date: -1 });

// Update the updatedAt field before saving
habitCompletionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.completed && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

// Static method to get completion stats for a user
habitCompletionSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const stats = await this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        totalCompletions: { $sum: { $cond: ['$completed', 1, 0] } },
        totalAttempts: { $sum: 1 },
        averageMood: { $avg: { $cond: ['$completed', { $switch: {
          branches: [
            { case: { $eq: ['$mood', 'excellent'] }, then: 5 },
            { case: { $eq: ['$mood', 'good'] }, then: 4 },
            { case: { $eq: ['$mood', 'neutral'] }, then: 3 },
            { case: { $eq: ['$mood', 'difficult'] }, then: 2 },
            { case: { $eq: ['$mood', 'struggled'] }, then: 1 }
          ],
          default: 3
        }}, null] } },
        averageDifficulty: { $avg: { $cond: ['$completed', '$difficulty', null] } }
      }
    }
  ]);
  
  return stats[0] || { totalCompletions: 0, totalAttempts: 0, averageMood: 0, averageDifficulty: 0 };
};

module.exports = mongoose.model("HabitCompletion", habitCompletionSchema);
