/**
 * Database Cleanup Script - HabitFlow Personal Habit Tracking System
 * Removes unnecessary databases to prevent confusion
 */

const { MongoClient } = require('mongodb');

async function cleanupDatabases() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    // List all databases
    const adminDb = client.db('admin');
    const dbs = await adminDb.admin().listDatabases();
    
    console.log('Available databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Keep only 'habitflow' database, drop 'habitflow-db' if it exists
    for (const db of dbs.databases) {
      if (db.name === 'habitflow-db') {
        console.log(`Dropping database: ${db.name}`);
        await client.db(db.name).dropDatabase();
        console.log(`✅ Successfully dropped ${db.name}`);
      }
    }
    
    // List databases after cleanup
    const dbsAfter = await adminDb.admin().listDatabases();
    console.log('\nDatabases after cleanup:');
    dbsAfter.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    console.log('\n✅ Database cleanup completed successfully.');
    console.log('👉 The application now exclusively uses: "habitflow" database');

  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

cleanupDatabases();
