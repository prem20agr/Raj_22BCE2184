/**
 * Database Seed Script - HabitFlow Personal Habit Tracking System
 * Author: Raj Agarwal <raj.agarwal@habitflow.app>
 * Description: Seeds the database with sample users, habits, and habit completions for testing
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Habit = require('./models/Habit');
const HabitCompletion = require('./models/HabitCompletion');

// Sample users for testing
const sampleUsers = [
  {
    firstname: "John",
    lastname: "Smith",
    username: "johnsmith",
    email: "john.smith@example.com",
    password: "securepass123",
    age: 28,
    timezone: "America/New_York",
    preferences: {
      theme: "light",
      notifications: true,
      weekStartDay: 1
    }
  },
  {
    firstname: "Sarah",
    lastname: "Johnson", 
    username: "sarahj",
    email: "sarah.j@example.com",
    password: "mypassword456",
    age: 32,
    timezone: "America/Los_Angeles",
    preferences: {
      theme: "dark",
      notifications: false,
      weekStartDay: 0
    }
  },
  {
    firstname: "Mike",
    lastname: "Chen",
    username: "mikechen",
    email: "mike.chen@example.com", 
    password: "password789",
    age: 25,
    timezone: "Asia/Shanghai",
    preferences: {
      theme: "light",
      notifications: true,
      weekStartDay: 1
    }
  }
];

// Sample habits for testing
const sampleHabits = [
  {
    name: "Daily Exercise",
    description: "Complete 30 minutes of physical activity",
    category: "Fitness",
    targetFrequency: "daily",
    priority: "high",
    reminders: ["08:00"],
    isActive: true
  },
  {
    name: "Read for 20 minutes",
    description: "Read books or educational material",
    category: "Learning",
    targetFrequency: "daily", 
    priority: "medium",
    reminders: ["20:00"],
    isActive: true
  },
  {
    name: "Meditate",
    description: "Practice mindfulness and meditation",
    category: "Mindfulness",
    targetFrequency: "daily",
    priority: "high", 
    reminders: ["07:00", "22:00"],
    isActive: true
  },
  {
    name: "Drink 8 glasses of water",
    description: "Stay hydrated throughout the day",
    category: "Health",
    targetFrequency: "daily",
    priority: "medium",
    reminders: ["09:00", "13:00", "17:00"],
    isActive: true
  },
  {
    name: "Weekly meal prep",
    description: "Prepare healthy meals for the week",
    category: "Health",
    targetFrequency: "weekly",
    priority: "medium", 
    reminders: ["10:00"],
    isActive: true
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habitflow');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Habit.deleteMany({});
    await HabitCompletion.deleteMany({});
    console.log('Cleared existing data');

    // Create users with hashed passwords
    const users = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.username}`);
    }

    // Create habits for each user
    const habits = [];
    for (const user of users) {
      for (const habitData of sampleHabits) {
        const habit = new Habit({
          ...habitData,
          userId: user._id
        });
        await habit.save();
        habits.push(habit);
        console.log(`Created habit: ${habit.name} for user: ${user.username}`);
      }
    }

    // Create some sample habit completions
    const completions = [];
    const today = new Date();
    
    for (const habit of habits) {
      // Create completions for the last 7 days
      for (let i = 0; i < 7; i++) {
        const completionDate = new Date(today);
        completionDate.setDate(today.getDate() - i);
        completionDate.setHours(0, 0, 0, 0); // Set to beginning of day
        
        // Randomly decide if habit was completed (80% chance)
        if (Math.random() > 0.2) {
          const completion = new HabitCompletion({
            habitId: habit._id,
            userId: habit.userId,
            date: completionDate,
            notes: i === 0 ? "Feeling great!" : ""
          });
          await completion.save();
          completions.push(completion);
        }
      }
    }

    console.log(`Created ${completions.length} habit completions`);
    console.log('Database seeded successfully!');
    
    // Print summary
    console.log('\n=== SEED SUMMARY ===');
    console.log(`Users created: ${users.length}`);
    console.log(`Habits created: ${habits.length}`);
    console.log(`Habit completions created: ${completions.length}`);
    console.log('\n=== TEST LOGIN CREDENTIALS ===');
    console.log('Username: johnsmith, Password: securepass123');
    console.log('Username: sarahj, Password: mypassword456'); 
    console.log('Username: mikechen, Password: password789');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();
