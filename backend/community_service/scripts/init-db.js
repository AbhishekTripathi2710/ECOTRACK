const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log('Connected to MySQL server');

    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'epics_community'}`);
    console.log(`Database ${process.env.DB_NAME || 'epics_community'} created or already exists`);
    
    await connection.query(`USE ${process.env.DB_NAME || 'epics_community'}`);
    
    await connection.query(`DROP TABLE IF EXISTS challenge_participants`);
    
    await connection.query(`DROP TABLE IF EXISTS user_achievements`);
    await connection.query(`DROP TABLE IF EXISTS user_challenges`);
    await connection.query(`DROP TABLE IF EXISTS user_stats`);
    await connection.query(`DROP TABLE IF EXISTS achievements`);
    await connection.query(`DROP TABLE IF EXISTS challenges`);
    
    console.log('Dropped existing tables');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(24) NOT NULL,
        total_points INT DEFAULT 0,
        weekly_points INT DEFAULT 0,
        monthly_points INT DEFAULT 0,
        yearly_points INT DEFAULT 0,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user (user_id)
      )
    `);
    console.log('user_stats table created or already exists');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS challenges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        points INT DEFAULT 0,
        start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        end_date TIMESTAMP,
        status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('challenges table created or already exists');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_challenges (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(24) NOT NULL,
        challenge_id INT NOT NULL,
        progress INT DEFAULT 0,
        completed BOOLEAN DEFAULT FALSE,
        completed_at TIMESTAMP NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_challenge (user_id, challenge_id)
      )
    `);
    console.log('user_challenges table created or already exists');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        points INT DEFAULT 0,
        criteria_type ENUM('points', 'challenges', 'carbon_reduction') NOT NULL,
        criteria_value INT NOT NULL,
        icon VARCHAR(255) DEFAULT 'default-achievement-icon',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('achievements table created or already exists');
    
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(24) NOT NULL,
        achievement_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_achievement (user_id, achievement_id)
      )
    `);
    console.log('user_achievements table created or already exists');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await connection.end();
  }
}

initializeDatabase(); 