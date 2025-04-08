-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS epics_community;
USE epics_community;

-- Note: We're not creating a community_users table because we'll use the users table from the main application

-- Create user_stats table
CREATE TABLE IF NOT EXISTS user_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_points INT DEFAULT 0,
    weekly_points INT DEFAULT 0,
    monthly_points INT DEFAULT 0,
    yearly_points INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user (user_id)
    -- No foreign key constraint since the users table is in another database
);

-- Drop and recreate the achievements table to include new fields
DROP TABLE IF EXISTS achievements;
CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(255) NOT NULL,
    criteria_type ENUM('points', 'challenges', 'carbon_reduction', 'duration', 'helping_others') NOT NULL,
    criteria_value INT NOT NULL,
    threshold FLOAT NULL,
    points INT DEFAULT 100,
    badge_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample achievements for all criteria types
INSERT INTO achievements (title, description, criteria_type, criteria_value, threshold, points, badge_url) VALUES
    -- Points-based achievements
    ('Carbon Footprint Beginner', 'Complete your first carbon footprint calculation', 'points', 100, NULL, 100, '/badges/beginner.png'),
    ('Green Explorer', 'Reach 500 sustainability points', 'points', 500, NULL, 250, '/badges/explorer.png'),
    ('Eco Master', 'Reach 2000 sustainability points', 'points', 2000, NULL, 500, '/badges/master.png'),
    
    -- Challenge-based achievements
    ('Challenge Taker', 'Complete your first community challenge', 'challenges', 1, NULL, 150, '/badges/challenger.png'),
    ('Green Champion', 'Complete 5 community challenges', 'challenges', 5, NULL, 300, '/badges/champion.png'),
    ('Sustainability Leader', 'Complete 10 community challenges', 'challenges', 10, NULL, 600, '/badges/leader.png'),
    
    -- Carbon reduction achievements
    ('Carbon Reducer', 'Reduce your carbon footprint by 5%', 'carbon_reduction', 5, NULL, 200, '/badges/reducer.png'),
    ('Eco Warrior', 'Reduce your carbon footprint by 10%', 'carbon_reduction', 10, NULL, 400, '/badges/warrior.png'),
    ('Climate Guardian', 'Reduce your carbon footprint by 20%', 'carbon_reduction', 20, NULL, 800, '/badges/guardian.png'),
    
    -- Duration-based achievements
    ('Consistent Green', 'Maintain a low carbon footprint for 1 month', 'duration', 1, 1000, 300, '/badges/consistent.png'),
    ('Sustainability Committed', 'Maintain a low carbon footprint for 2 months', 'duration', 2, 1000, 600, '/badges/committed.png'),
    ('Sustainability Expert', 'Maintain a low carbon footprint for 3 months', 'duration', 3, 1000, 1000, '/badges/expert.png'),
    
    -- Helping others achievements
    ('Community Helper', 'Help 1 user reduce their carbon footprint', 'helping_others', 1, NULL, 250, '/badges/helper.png'),
    ('Community Mentor', 'Help 3 users reduce their carbon footprint', 'helping_others', 3, NULL, 500, '/badges/mentor.png'),
    ('Climate Change Fighter', 'Help 5 users reduce their carbon footprint', 'helping_others', 5, NULL, 1000, '/badges/fighter.png');

-- Create user_achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    achievement_id INT,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_achievement (user_id, achievement_id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
    -- No foreign key constraint for user_id since the users table is in another database
);

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    challenge_type VARCHAR(50) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    reward_points INT NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- No foreign key constraint for creator_id since the users table is in another database
);

-- Create challenge_participants table
CREATE TABLE IF NOT EXISTS challenge_participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    challenge_id INT,
    user_id INT NOT NULL,
    progress INT DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_participant (challenge_id, user_id),
    FOREIGN KEY (challenge_id) REFERENCES challenges(id)
    -- No foreign key constraint for user_id since the users table is in another database
); 