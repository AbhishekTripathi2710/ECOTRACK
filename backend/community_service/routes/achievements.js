const express = require('express');
const router = express.Router();
const { query } = require('../models/db');
const auth = require('../middleware/auth');

// Get all achievements
router.get('/', async (req, res) => {
  try {
    // Get all achievements
    const achievements = await query(`
      SELECT * FROM achievements 
      ORDER BY criteria_type, criteria_value
    `);
    
    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get user's achievements
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting achievements for user:', userId);
    
    // Fix the field names to match the database schema
    const userAchievements = await query(
      `SELECT a.*, ua.unlocked_at
       FROM user_achievements ua
       JOIN achievements a ON ua.achievement_id = a.id
       WHERE ua.user_id = ?`,
      [userId]
    );
    
    res.json({
      success: true,
      data: userAchievements
    });
  } catch (error) {
    console.error('User achievements error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Check for achievements after carbon footprint update
router.post('/check', auth, async (req, res) => {
  try {
    const { userId, carbonReduction, carbonData } = req.body;
    
    // Get user's current points
    const userStats = await query(`
      SELECT * FROM user_stats WHERE user_id = ?
    `, [userId]);
    
    if (userStats.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User stats not found'
      });
    }
    
    const totalPoints = userStats[0].total_points;
    
    // Get user's challenge stats
    const challengeStats = await query(`
      SELECT COUNT(*) as completed_challenges
      FROM user_challenges 
      WHERE user_id = ? AND completed = 1
    `, [userId]);
    
    const completedChallenges = challengeStats[0]?.completed_challenges || 0;
    
    // Find achievements the user qualifies for
    const eligibleAchievements = [];
    
    // 1. Points-based achievements
    const pointAchievements = await query(`
      SELECT * FROM achievements 
      WHERE criteria_type = 'points' AND criteria_value <= ?
    `, [totalPoints]);
    eligibleAchievements.push(...pointAchievements);
    
    // 2. Challenge-based achievements
    const challengeAchievements = await query(`
      SELECT * FROM achievements 
      WHERE criteria_type = 'challenges' AND criteria_value <= ?
    `, [completedChallenges]);
    eligibleAchievements.push(...challengeAchievements);
    
    // 3. Carbon reduction achievements (if data provided)
    if (carbonReduction) {
      const carbonAchievements = await query(`
        SELECT * FROM achievements 
        WHERE criteria_type = 'carbon_reduction' AND criteria_value <= ?
      `, [carbonReduction]);
      eligibleAchievements.push(...carbonAchievements);
    }
    
    // 4. Duration-based achievements (if carbon history provided)
    if (carbonData && carbonData.history && carbonData.history.length > 0) {
      const durationAchievements = await query(`
        SELECT * FROM achievements 
        WHERE criteria_type = 'duration'
      `);
      
      // For each duration achievement, check if user qualifies
      for (const achievement of durationAchievements) {
        const durationMonths = achievement.criteria_value;
        const threshold = achievement.threshold || 1000; // Default threshold
        
        const NOW = new Date();
        const thresholdDate = new Date();
        thresholdDate.setMonth(thresholdDate.getMonth() - durationMonths);
        
        // Get readings since the threshold date
        const relevantReadings = carbonData.history.filter(entry => 
          new Date(entry.date) >= thresholdDate);
        
        // If we have enough readings and all are below threshold, add achievement
        if (relevantReadings.length >= durationMonths && 
            relevantReadings.every(entry => entry.carbonFootprint <= threshold)) {
          eligibleAchievements.push(achievement);
        }
      }
    }
    
    // Track newly awarded achievements
    const newAchievements = [];
    
    // Award eligible achievements
    for (const achievement of eligibleAchievements) {
      // Check if already earned
      const existingAchievement = await query(`
        SELECT * FROM user_achievements 
        WHERE user_id = ? AND achievement_id = ?
      `, [userId, achievement.id]);
      
      if (existingAchievement.length === 0) {
        // Award achievement
        await query(`
          INSERT INTO user_achievements (user_id, achievement_id)
          VALUES (?, ?)
        `, [userId, achievement.id]);
        
        // Add achievement points to user
        await query(`
          UPDATE user_stats 
          SET 
            total_points = total_points + ?,
            weekly_points = weekly_points + ?,
            monthly_points = monthly_points + ?,
            yearly_points = yearly_points + ?
          WHERE user_id = ?
        `, [
          achievement.points, 
          achievement.points, 
          achievement.points, 
          achievement.points, 
          userId
        ]);
        
        newAchievements.push(achievement);
      }
    }
    
    res.json({
      success: true,
      data: {
        newAchievements,
        totalAwarded: newAchievements.length
      }
    });
  } catch (error) {
    console.error('Check achievements error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router; 