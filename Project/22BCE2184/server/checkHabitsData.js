/**
 * Script to check and fix habit frequency data
 */

const mongoose = require('mongoose');
require('./models/Habit'); // Load Habit model
const Habit = mongoose.model('Habit');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habitflow';
    const conn = await mongoose.connect(mongoURI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Function to check and fix habit data
const checkAndFixHabitsData = async () => {
  try {
    console.log('📋 Checking habits data...');
    
    // Get all habits
    const habits = await Habit.find({});
    console.log(`Found ${habits.length} habits`);
    
    let fixedCount = 0;
    
    // Check each habit
    for (const habit of habits) {
      console.log(`\n🔍 Examining habit: ${habit.name} (ID: ${habit._id})`);
      console.log(`  - Frequency: ${habit.frequency} (Type: ${typeof habit.frequency})`);
      
      let needsUpdate = false;
      
      // Fix missing or invalid frequency
      if (!habit.frequency || typeof habit.frequency !== 'string') {
        habit.frequency = 'Daily';
        needsUpdate = true;
        console.log(`  ✅ Fixed frequency: set to "Daily"`);
      }
      
      // Save if updates needed
      if (needsUpdate) {
        await habit.save();
        fixedCount++;
        console.log(`  💾 Saved updates`);
      } else {
        console.log(`  ✓ No updates needed`);
      }
    }
    
    console.log(`\n✅ Check complete. Fixed ${fixedCount} habits.`);
  } catch (error) {
    console.error('❌ Error checking habits:', error);
  } finally {
    // Close the database connection
    mongoose.connection.close();
    console.log('📌 Database connection closed');
  }
};

// Run the script
connectDB().then(() => {
  checkAndFixHabitsData();
});
