const express = require('express');
const router = express.Router();
const { query } = require('../models/db');
const auth = require('../middleware/auth');

// Function to check and award achievements related to challenges
async function checkChallengeAchievements(userId) {
  try {
    console.log('Checking challenge achievements for user:', userId);
    
    // Get the count of completed challenges for the user
    const completedChallenges = await query(
      'SELECT COUNT(*) as count FROM user_challenges WHERE user_id = ? AND completed = 1',
      [userId]
    );
    
    const challengeCount = completedChallenges[0].count;
    console.log(`User has completed ${challengeCount} challenges`);
    
    // Get all achievements related to challenges
    const challengeAchievements = await query(
      "SELECT * FROM achievements WHERE criteria_type = 'challenges'"
    );
    
    console.log(`Found ${challengeAchievements.length} challenge-related achievements`);
    
    // Check each achievement
    for (const achievement of challengeAchievements) {
      // Check if user already has this achievement
      const existingAchievement = await query(
        'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
        [userId, achievement.id]
      );
      
      // If user doesn't have the achievement and meets the criteria
      if (existingAchievement.length === 0 && challengeCount >= achievement.criteria_value) {
        console.log(`Awarding achievement: ${achievement.title} to user ${userId}`);
        
        // Award the achievement
        await query(
          'INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, NOW())',
          [userId, achievement.id]
        );
        
        // Award points for the achievement
        const userStats = await query(
          'SELECT * FROM user_stats WHERE user_id = ?',
          [userId]
        );
        
        const pointsToAward = achievement.points || 0;
        
        if (userStats.length === 0) {
          // Create new user stats
          await query(
            `INSERT INTO user_stats (user_id, total_points, weekly_points, monthly_points, yearly_points)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, pointsToAward, pointsToAward, pointsToAward, pointsToAward]
          );
        } else {
          // Update existing user stats
          await query(
            `UPDATE user_stats
             SET total_points = total_points + ?,
                 weekly_points = weekly_points + ?,
                 monthly_points = monthly_points + ?,
                 yearly_points = yearly_points + ?
             WHERE user_id = ?`,
            [pointsToAward, pointsToAward, pointsToAward, pointsToAward, userId]
          );
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking challenge achievements:', error);
    return false;
  }
}

// Get all challenges
router.get('/', async (req, res) => {
  try {
    // Get all active challenges
    const challenges = await query(`
      SELECT * FROM challenges 
      WHERE status = 'active' AND end_date > NOW()
      ORDER BY start_date DESC
    `);
    
    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get user's challenges
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting challenges for user:', userId);
    
    // Get challenges joined by the user
    const userChallenges = await query(`
      SELECT 
        c.*,
        uc.progress,
        uc.joined_at,
        uc.completed
      FROM challenges c
      JOIN user_challenges uc ON c.id = uc.challenge_id
      WHERE uc.user_id = ?
      ORDER BY uc.joined_at DESC
    `, [userId]);
    
    console.log(`Found ${userChallenges.length} challenges for user ${userId}`);
    console.log('User challenges data:', JSON.stringify(userChallenges, null, 2));
    
    res.json({
      success: true,
      data: userChallenges
    });
  } catch (error) {
    console.error('Get user challenges error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Join a challenge
router.post('/join', async (req, res) => {
  try {
    const { userId, challengeId } = req.body;
    console.log('User joining challenge:', userId, 'Challenge ID:', challengeId);
    
    if (!userId || !challengeId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and challenge ID are required'
      });
    }
    
    // Check if user already joined this challenge
    const existing = await query(
      'SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );
    
    if (existing.length > 0) {
      return res.json({
        success: true,
        message: 'User already joined this challenge',
        data: existing[0]
      });
    }
    
    // Join the challenge
    await query(
      `INSERT INTO user_challenges (user_id, challenge_id, progress, joined_at)
       VALUES (?, ?, 0, NOW())`,
      [userId, challengeId]
    );
    
    // Get challenge details
    const challenge = await query(
      'SELECT * FROM challenges WHERE id = ?',
      [challengeId]
    );
    
    res.json({
      success: true,
      message: 'Challenge joined successfully',
      data: {
        userId,
        challengeId,
        challenge: challenge[0],
        progress: 0,
        joined_at: new Date()
      }
    });
  } catch (error) {
    console.error('Join challenge error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Update challenge progress
router.post('/progress', async (req, res) => {
  try {
    const { userId, challengeId, progress } = req.body;
    console.log('Updating challenge progress for user:', userId, 'Challenge ID:', challengeId, 'Progress:', progress);
    
    if (!userId || !challengeId || progress === undefined) {
      return res.status(400).json({
        success: false,
        error: 'User ID, challenge ID, and progress are required'
      });
    }
    
    // Check if user has joined this challenge
    const existing = await query(
      'SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?',
      [userId, challengeId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User has not joined this challenge'
      });
    }
    
    // Update progress
    await query(
      `UPDATE user_challenges
       SET progress = ?
       WHERE user_id = ? AND challenge_id = ?`,
      [progress, userId, challengeId]
    );
    
    // Check if challenge is completed
    const completed = progress >= 100;
    
    // If completed, mark as completed and award points
    if (completed && !existing[0].completed) {
      // Get challenge points
      const challenge = await query(
        'SELECT * FROM challenges WHERE id = ?',
        [challengeId]
      );
      
      const pointsToAward = challenge[0].points || 0;
      
      // Mark as completed
      await query(
        `UPDATE user_challenges
         SET completed = 1,
             completed_at = NOW()
         WHERE user_id = ? AND challenge_id = ?`,
        [userId, challengeId]
      );
      
      // Award points to user
      const userStats = await query(
        'SELECT * FROM user_stats WHERE user_id = ?',
        [userId]
      );
      
      if (userStats.length === 0) {
        // Create new user stats
        await query(
          `INSERT INTO user_stats (user_id, total_points, weekly_points, monthly_points, yearly_points)
           VALUES (?, ?, ?, ?, ?)`,
          [userId, pointsToAward, pointsToAward, pointsToAward, pointsToAward]
        );
      } else {
        // Update existing user stats
        await query(
          `UPDATE user_stats
           SET total_points = total_points + ?,
               weekly_points = weekly_points + ?,
               monthly_points = monthly_points + ?,
               yearly_points = yearly_points + ?,
               last_updated = NOW()
           WHERE user_id = ?`,
          [pointsToAward, pointsToAward, pointsToAward, pointsToAward, userId]
        );
      }
      
      // Check for achievements related to challenges
      await checkChallengeAchievements(userId);
      
      return res.json({
        success: true,
        message: 'Challenge completed and points awarded',
        data: {
          userId,
          challengeId,
          progress,
          completed: true,
          pointsAwarded: pointsToAward
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: {
        userId,
        challengeId,
        progress,
        completed
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router; 