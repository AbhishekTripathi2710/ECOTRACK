const express = require('express');
const router = express.Router();
const { query, mongoose } = require('../models/db');
const auth = require('../middleware/auth');
const User = require('../models/User');

router.get('/top', async (req, res) => {
  try {
    const { period = 'weekly', limit = 10 } = req.query;
    
    const userCountResult = await query(
      'SELECT COUNT(*) as count FROM user_stats'
    );
    
    const userCount = userCountResult[0].count;
    console.log(`Current user count in user_stats: ${userCount}`);
    
    if (userCount === 0) {
      console.log('No users found in user_stats, creating test users...');
      
      const mongoUsers = await User.find({}).lean();
      console.log(`Found ${mongoUsers.length} users in MongoDB`);
      
      if (mongoUsers.length > 0) {
        const testUsers = mongoUsers.slice(0, Math.min(3, mongoUsers.length));
        
        for (let i = 0; i < testUsers.length; i++) {
          const testUserId = testUsers[i]._id.toString();
          const points = Math.floor(Math.random() * 500) + 100;
          
          await query(
            `INSERT INTO user_stats (user_id, total_points, weekly_points, monthly_points, yearly_points) 
             VALUES (?, ?, ?, ?, ?)`,
            [testUserId, points, points, points, points]
          );
          
          console.log(`Created test user ${testUserId} with ${points} points`);
        }
      } else {
        await query(
          `INSERT INTO user_stats (user_id, total_points, weekly_points, monthly_points, yearly_points) 
           VALUES (?, ?, ?, ?, ?)`,
          ['testuser1', 250, 250, 250, 250]
        );
        console.log('Created dummy test user with 250 points');
      }
    }
    
    const totalUsersResult = await query(
      'SELECT COUNT(*) as total FROM user_stats'
    );
    
    const totalUsers = totalUsersResult[0].total;
    
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
    
    const leaderboardData = await query(sql);
    
    console.log(`Fetched ${leaderboardData.length} users for leaderboard`);
    
    try {
      const userIds = leaderboardData.map(entry => entry.user_id);
      console.log('User IDs to fetch:', userIds);
      
      const mongoUsers = await User.find({}).lean();  
      console.log(`Fetched ${mongoUsers.length} users from MongoDB`);
      
      const combinedData = leaderboardData.map(entry => {
        let mongoUser = mongoUsers.find(u => u._id.toString() === entry.user_id);
        
        if (!mongoUser) {
          mongoUser = mongoUsers[0]; 
        }
        
        return {
          ...entry,
          username: mongoUser?.username || `User ${entry.user_id}`,
          email: mongoUser?.email || '',
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

router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting rank for user:', userId);
    
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
          display_name: userDetails?.fullname?.firstname || userDetails?.username || `User ${userId}`
        }
      });
    } catch (mongoErr) {
      console.error('MongoDB error when getting user details:', mongoErr);
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
    
    try {
      const userExists = await User.findById(userId).lean();
      if (!userExists) {
        console.log('User not found in MongoDB:', userId);
      }
    } catch (mongoErr) {
      console.error('MongoDB find error:', mongoErr);
    }
    
    const pointsToAward = 100;
    
    try {
      const userStats = await query(
        'SELECT * FROM user_stats WHERE user_id = ?',
        [userId]
      );
      
      if (userStats.length === 0) {
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

router.post('/update-points', auth, async (req, res) => {
  try {
    const { userId, points } = req.body;
    
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'User not found in MongoDB'
      });
    }
    
    const userStats = await query(
      'SELECT * FROM user_stats WHERE user_id = ?',
      [userId]
    );
    
    if (userStats.length === 0) {
      await query(
        `INSERT INTO user_stats (user_id, total_points, weekly_points, monthly_points, yearly_points) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, points, points, points, points]
      );
    } else {
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