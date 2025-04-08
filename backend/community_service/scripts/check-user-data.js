const { query } = require('../models/db');
require('dotenv').config();

async function checkUserData() {
  try {
    console.log('Checking data for user 67f41d0e35c5a0c5657c9af5...');
    
    const userId = '67f41d0e35c5a0c5657c9af5';
    
    // Check user stats
    console.log('\nUser Stats:');
    const stats = await query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
    console.log(JSON.stringify(stats, null, 2));
    
    // Check user challenges
    console.log('\nUser Challenges:');
    const challenges = await query('SELECT * FROM user_challenges WHERE user_id = ?', [userId]);
    console.log(JSON.stringify(challenges, null, 2));
    
    // Check user achievements
    console.log('\nUser Achievements:');
    const achievements = await query('SELECT * FROM user_achievements WHERE user_id = ?', [userId]);
    console.log(JSON.stringify(achievements, null, 2));
    
    console.log('\nData check completed');
  } catch (error) {
    console.error('Error checking data:', error);
  }
}

// Run the function
checkUserData(); 