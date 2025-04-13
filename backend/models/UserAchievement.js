const mysql = require('mysql2/promise');
const pool = require('../db/db');
const mongoose = require('mongoose');

class UserAchievement {
  static async create(userId, achievementId) {
    const connection = await pool.getConnection();
    try {
      // Convert MongoDB ObjectId to string
      const achievementIdStr = achievementId.toString();
      const userIdStr = userId.toString();
      
      console.log('Creating user achievement:', { userId: userIdStr, achievementId: achievementIdStr });
      
      const [result] = await connection.execute(
        'INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, NOW())',
        [userIdStr, achievementIdStr]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating user achievement:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async getUserAchievements(userId) {
    const connection = await pool.getConnection();
    try {
      const userIdStr = userId.toString();
      console.log('Fetching achievements for user:', userIdStr);
      
      const [rows] = await connection.execute(
        `SELECT a.*, ua.unlocked_at
         FROM user_achievements ua
         JOIN achievements a ON ua.achievement_id = a.id
         WHERE ua.user_id = ?`,
        [userIdStr]
      );
      
      console.log('Found achievement rows:', rows);
      
      // Convert string IDs back to ObjectIds
      const achievementIds = rows.map(row => {
        try {
          return new mongoose.Types.ObjectId(row.achievement_id);
        } catch (error) {
          console.error('Error converting achievement ID:', row.achievement_id, error);
          return null;
        }
      }).filter(id => id !== null);
      
      console.log('Converted achievement IDs:', achievementIds);
      return achievementIds;
    } catch (error) {
      console.error('Error getting user achievements:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async hasAchievement(userId, achievementId) {
    const connection = await pool.getConnection();
    try {
      const userIdStr = userId.toString();
      const achievementIdStr = achievementId.toString();
      
      console.log('Checking if user has achievement:', { userId: userIdStr, achievementId: achievementIdStr });
      
      const [rows] = await connection.execute(
        'SELECT 1 FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
        [userIdStr, achievementIdStr]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking user achievement:', error);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = UserAchievement; 