const { query } = require('../models/db');
require('dotenv').config();

async function updateUserChallengesTable() {
  try {
    console.log('Updating user_challenges table...');
    
    const columns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'user_challenges' AND COLUMN_NAME = 'completed'
    `);
    
    if (columns.length === 0) {
      console.log('Adding completed column to user_challenges table...');
      await query(`
        ALTER TABLE user_challenges
        ADD COLUMN completed BOOLEAN DEFAULT FALSE,
        ADD COLUMN completed_at TIMESTAMP NULL
      `);
      console.log('Completed column added successfully');
    } else {
      console.log('Completed column already exists');
    }
    
    console.log('Updating completed status based on progress...');
    await query(`
      UPDATE user_challenges
      SET completed = TRUE, completed_at = NOW()
      WHERE progress >= 100 AND completed = FALSE
    `);
    
    console.log('User challenges table updated successfully');
  } catch (error) {
    console.error('Error updating user_challenges table:', error);
  }
}

updateUserChallengesTable(); 