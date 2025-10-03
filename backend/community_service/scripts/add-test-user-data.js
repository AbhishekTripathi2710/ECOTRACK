const { query } = require('../models/db');
require('dotenv').config();

async function addTestUserData() {
  try {
    console.log('Adding test data for user 67f41d0e35c5a0c5657c9af5...');
    
    const userId = '67f41d0e35c5a0c5657c9af5';
    
   
    const existingStats = await query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
    
    if (existingStats.length === 0) {
      await query(
        `INSERT INTO user_stats (user_id, weekly_points, monthly_points, yearly_points, total_points) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, 100, 250, 500, 1000]
      );
      console.log(`Added points for user ${userId}`);
    } else {
      console.log(`User ${userId} already has points`);
    }
    
    const challenges = await query('SELECT id FROM challenges');
    
    if (challenges.length > 0) {
      const challengeId = challenges[0].id;
      
      const existingJoin = await query('SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?', [userId, challengeId]);
      
      if (existingJoin.length === 0) {
        await query(
          'INSERT INTO user_challenges (user_id, challenge_id, progress) VALUES (?, ?, ?)',
          [userId, challengeId, 50] 
        );
        console.log(`User ${userId} joined challenge ${challengeId} with 50% progress`);
      } else {
        console.log(`User ${userId} already joined challenge ${challengeId}`);
      }
      
      if (challenges.length > 1) {
        const challengeId2 = challenges[1].id;
        
        const existingJoin2 = await query('SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?', [userId, challengeId2]);
        
        if (existingJoin2.length === 0) {
          await query(
            'INSERT INTO user_challenges (user_id, challenge_id, progress) VALUES (?, ?, ?)',
            [userId, challengeId2, 75] 
          );
          console.log(`User ${userId} joined challenge ${challengeId2} with 75% progress`);
        } else {
          console.log(`User ${userId} already joined challenge ${challengeId2}`);
        }
      }
    }
    
    const achievements = await query('SELECT id FROM achievements');
    
    if (achievements.length > 0) {
      const achievementId = achievements[0].id;
      
      const existingAward = await query('SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?', [userId, achievementId]);
      
      if (existingAward.length === 0) {
        await query(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [userId, achievementId]
        );
        console.log(`User ${userId} earned achievement ${achievementId}`);
      } else {
        console.log(`User ${userId} already earned achievement ${achievementId}`);
      }
      
      if (achievements.length > 1) {
        const achievementId2 = achievements[1].id;
        
        const existingAward2 = await query('SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?', [userId, achievementId2]);
        
        if (existingAward2.length === 0) {
          await query(
            'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
            [userId, achievementId2]
          );
          console.log(`User ${userId} earned achievement ${achievementId2}`);
        } else {
          console.log(`User ${userId} already earned achievement ${achievementId2}`);
        }
      }
    }
    
    console.log('Test data added successfully');
  } catch (error) {
    console.error('Error adding test data:', error);
  }
}

addTestUserData(); 