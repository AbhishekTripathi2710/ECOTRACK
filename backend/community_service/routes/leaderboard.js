const express = require('express');
const router = express.Router();
const { query, mongoose } = require('../models/db');
const auth = require('../middleware/auth');
// Use the local User model
const User = require('../models/User');

// Get top users
router.get('/top', async (req, res) => {
  try {
    const { period = 'weekly', limit = 10 } = req.query;
    
    // Check if any users exist in the system
    const userCountResult = await query(
      'SELECT COUNT(*) as count FROM user_stats'
    );
    
    const userCount = userCountResult[0].count;
    console.log(`Current user count in user_stats: ${userCount}`);
    
    // If no users exist, create some test users for demo purposes
    if (userCount === 0) {
      console.log('No users found in user_stats, creating test users...');
      
      // Get MongoDB users to use their IDs
      const mongoUsers = await User.find({}).lean();
      console.log(`Found ${mongoUsers.length} users in MongoDB`);
      
      if (mongoUsers.length > 0) {
        // Create test users with MongoDB IDs
        const testUsers = mongoUsers.slice(0, Math.min(3, mongoUsers.length));
        
        for (let i = 0; i < testUsers.length; i++) {
          const testUserId = testUsers[i]._id.toString();
          const points = Math.floor(Math.random() * 500) + 100; // Random points between 100-600
          
          await query(
            `INSERT INTO user_stats (user_id, total_points, weekly_points, monthly_points, yearly_points) 
             VALUES (?, ?, ?, ?, ?)`,
            [testUserId, points, points, points, points]
          );
          
          console.log(`Created test user ${testUserId} with ${points} points`);
        }
      } else {
        // Create a dummy test user if no MongoDB users exist
        await query(
          `INSERT INTO user_stats (user_id, total_points, weekly_points, monthly_points, yearly_points) 
           VALUES (?, ?, ?, ?, ?)`,
          ['testuser1', 250, 250, 250, 250]
        );
        console.log('Created dummy test user with 250 points');
      }
    }
    
    // Get total users with or without points
    const totalUsersResult = await query(
      'SELECT COUNT(*) as total FROM user_stats'
    );
    
    const totalUsers = totalUsersResult[0].total;
    
    // Get leaderboard data from MySQL - include all users, even with 0 points
    let sql;
    if (period === 'weekly') {
      sql = `
        SELECT 
          user_id,
          weekly_points as points,
          total_points,
          monthly_points,
          yearly_points
        FROM user_stats
        ORDER BY weekly_points DESC 
        LIMIT ${parseInt(limit, 10)}`;
    } else if (period === 'monthly') {
      sql = `
        SELECT 
          user_id,
          monthly_points as points,
          total_points,
          weekly_points,
          yearly_points
        FROM user_stats
        ORDER BY monthly_points DESC 
        LIMIT ${parseInt(limit, 10)}`;
    } else if (period === 'yearly') {
      sql = `
        SELECT 
          user_id,
          yearly_points as points,
          total_points,
          weekly_points,
          monthly_points
        FROM user_stats
        ORDER BY yearly_points DESC 
        LIMIT ${parseInt(limit, 10)}`;
    } else {
      sql = `
        SELECT 
          user_id,
          total_points as points,
          weekly_points,
          monthly_points,
          yearly_points
        FROM user_stats
        ORDER BY total_points DESC 
        LIMIT ${parseInt(limit, 10)}`;
    }
    
    // Execute the query without parameters for the LIMIT clause
    const leaderboardData = await query(sql);
    
    console.log(`Fetched ${leaderboardData.length} users for leaderboard`);
    
    // Get current authenticated users
    try {
      // Fetch MongoDB user data for each user in the leaderboard
      const userIds = leaderboardData.map(entry => entry.user_id);
      console.log('User IDs to fetch:', userIds);
      
      const mongoUsers = await User.find({}).lean();  // Fetch all users for testing
      console.log(`Fetched ${mongoUsers.length} users from MongoDB`);
      
      // Combine the data
      const combinedData = leaderboardData.map(entry => {
        // Try exact match first
        let mongoUser = mongoUsers.find(u => u._id.toString() === entry.user_id);
        
        // If no match, try to find by numeric ID (for testing)
        if (!mongoUser) {
          mongoUser = mongoUsers[0]; // Just use the first user for testing
        }
        
        return {
          ...entry,
          username: mongoUser?.username || `User ${entry.user_id}`,
          email: mongoUser?.email || '',
          // Use firstname if available
          display_name: mongoUser?.fullname?.firstname || mongoUser?.username || `User ${entry.user_id}`
        };
      });
      
      res.json({
        success: true,
        data: {
          users: combinedData,
          totalUsers,
          period,
          limit: parseInt(limit, 10)
        }
      });
    } catch (mongoErr) {
      console.error('MongoDB error:', mongoErr);
      // If MongoDB fetch fails, still return MySQL data with generic usernames
      const fallbackData = leaderboardData.map(entry => ({
        ...entry,
        display_name: `User ${entry.user_id}`
      }));
      
      res.json({
        success: true,
        data: {
          users: fallbackData,
          totalUsers,
          period,
          limit: parseInt(limit, 10)
        }
      });
    }
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Get user's rank
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting rank for user:', userId);
    
    // Get user's data from MySQL
    const userData = await query(
      `SELECT * FROM user_stats WHERE user_id = ?`,
      [userId]
    );
    
    if (userData.length === 0) {
      console.log('User stats not found for user:', userId);
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }
    
    // Get user's rank - changed "rank" to "user_rank" to avoid SQL keyword issues
    const rankData = await query(
      `SELECT COUNT(*) + 1 as user_rank 
       FROM user_stats 
       WHERE total_points > (
         SELECT total_points 
         FROM user_stats 
         WHERE user_id = ?
       )`,
      [userId]
    );
    
    // Get user details from MongoDB
    try {
      const userDetails = await User.findById(userId).lean();
      console.log('User details from MongoDB:', userDetails);
      
      res.json({
        success: true,
        data: {
          ...userData[0],
          rank: rankData[0].user_rank,
          username: userDetails?.username || `User ${userId}`,
          email: userDetails?.email || '',
          // Use firstname if available
          display_name: userDetails?.fullname?.firstname || userDetails?.username || `User ${userId}`
        }
      });
    } catch (mongoErr) {
      console.error('MongoDB error when getting user details:', mongoErr);
      // If MongoDB fetch fails, still return MySQL data with generic username
      res.json({
        success: true,
        data: {
          ...userData[0],
          rank: rankData[0].user_rank,
          display_name: `User ${userId}`
        }
      });
    }
  } catch (error) {
    console.error('User rank error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Award points for calculating carbon footprint
router.post('/award-footprint-points', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    console.log('Awarding points to user:', userId);
    
    // Check if user exists in MongoDB
    try {
      const userExists = await User.findById(userId).lean();
      if (!userExists) {
        console.log('User not found in MongoDB:', userId);
        // For testing, continue even if user not found in MongoDB
      }
    } catch (mongoErr) {
      console.error('MongoDB find error:', mongoErr);
      // Continue even if MongoDB query fails
    }
    
    // Points to award for first-time carbon footprint calculation
    const pointsToAward = 100;
    
    // Check if user already has points for carbon footprint calculation
    try {
      const userStats = await query(
        'SELECT * FROM user_stats WHERE user_id = ?',
        [userId]
      );
      
      if (userStats.length === 0) {
        // Create new user stats with initial points
        await query(
          `INSERT INTO user_stats (user_id, total_points, weekly_points, monthly_points, yearly_points) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, pointsToAward, pointsToAward, pointsToAward, pointsToAward]
        );
        
        console.log(`Created new stats for user ${userId} with ${pointsToAward} points`);
        
        return res.json({ 
          success: true,
          message: `Awarded ${pointsToAward} points for first carbon footprint calculation`,
          points: pointsToAward
        });
      } else {
        // Always update points for demo purposes
        await query(
          `UPDATE user_stats 
           SET total_points = total_points + ?,
               weekly_points = weekly_points + ?,
               monthly_points = monthly_points + ?,
               yearly_points = yearly_points + ?,
               last_updated = CURRENT_TIMESTAMP
           WHERE user_id = ?`,
          [pointsToAward, pointsToAward, pointsToAward, pointsToAward, userId]
        );
        
        console.log(`Updated stats for user ${userId} with ${pointsToAward} additional points`);
        
        return res.json({ 
          success: true,
          message: `Awarded ${pointsToAward} points for carbon footprint calculation`,
          points: pointsToAward
        });
      }
    } catch (sqlErr) {
      console.error('SQL error in award points:', sqlErr);
      return res.status(500).json({ 
        success: false,
        error: sqlErr.message 
      });
    }
  } catch (error) {
    console.error('Award footprint points error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Update user points
router.post('/update-points', auth, async (req, res) => {
  try {
    const { userId, points } = req.body;
    
    // Check if user exists in MongoDB
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'User not found in MongoDB'
      });
    }
    
    // Check if user stats exist in MySQL, if not create them
    const userStats = await query(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    );
    
    if (userStats.length === 0) {
      // Create new user stats
      await query(
        `INSERT INTO user_stats (user_id, total_points, weekly_points, monthly_points, yearly_points) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, points, points, points, points]
      );
    } else {
      // Update existing user stats
      await query(
        `UPDATE user_stats 
         SET total_points = total_points + ?,
             weekly_points = weekly_points + ?,
             monthly_points = monthly_points + ?,
             yearly_points = yearly_points + ?,
             last_updated = CURRENT_TIMESTAMP
         WHERE user_id = ?`,
        [points, points, points, points, userId]
      );
    }
    
    res.json({ 
      success: true,
      message: 'Points updated successfully' 
    });
  } catch (error) {
    console.error('Update points error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router; 