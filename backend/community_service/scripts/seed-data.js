const { query } = require('../models/db');
require('dotenv').config();

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    const userIds = [1, 2, 3];

    for (const userId of userIds) {
      const existingStats = await query('SELECT * FROM user_stats WHERE user_id = ?', [userId]);
      
      if (existingStats.length === 0) {
        const weeklyPoints = Math.floor(Math.random() * 500);
        const monthlyPoints = weeklyPoints + Math.floor(Math.random() * 500);
        const yearlyPoints = monthlyPoints + Math.floor(Math.random() * 1000);
        const totalPoints = yearlyPoints + Math.floor(Math.random() * 2000);
        
        await query(
          `INSERT INTO user_stats (user_id, weekly_points, monthly_points, yearly_points, total_points) 
           VALUES (?, ?, ?, ?, ?)`,
          [userId, weeklyPoints, monthlyPoints, yearlyPoints, totalPoints]
        );
        console.log(`Added points for user ${userId}`);
      } else {
        console.log(`User ${userId} already has points`);
      }
    }

    const challenges = [
      {
        title: 'Reduce Carbon Footprint by 10%',
        description: 'Track your carbon emissions for a week and reduce them by 10% compared to your previous average.',
        points: 100,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
      },
      {
        title: 'Use Public Transportation for a Week',
        description: 'Use public transportation or carpool for your daily commute for an entire week.',
        points: 150,
        start_date: new Date(),
        end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) 
      },
      {
        title: 'Zero Waste Challenge',
        description: 'Produce zero waste for 7 days. Avoid single-use plastics and properly recycle or compost all waste.',
        points: 200,
        start_date: new Date(),
        end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) 
      },
      {
        title: 'Plant a Tree',
        description: 'Plant a tree in your community and document its growth over the next month.',
        points: 300,
        start_date: new Date(),
        end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) 
      },
      {
        title: 'Energy Audit Challenge',
        description: 'Conduct an energy audit of your home and implement at least 3 energy-saving measures.',
        points: 250,
        start_date: new Date(),
        end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) 
      }
    ];

    for (const challenge of challenges) {
      const existingChallenge = await query('SELECT * FROM challenges WHERE title = ?', [challenge.title]);
      
      if (existingChallenge.length === 0) {
        await query(
          `INSERT INTO challenges (title, description, points, start_date, end_date, status) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [challenge.title, challenge.description, challenge.points, challenge.start_date, challenge.end_date, 'active']
        );
        console.log(`Added challenge: ${challenge.title}`);
      } else {
        console.log(`Challenge "${challenge.title}" already exists`);
      }
    }

    const achievements = [
      {
        title: 'Carbon Rookie',
        description: 'Earn your first 100 points',
        points: 50,
        criteria_type: 'points',
        criteria_value: 100,
        icon: 'eco'
      },
      {
        title: 'Carbon Warrior',
        description: 'Earn 1000 points',
        points: 100,
        criteria_type: 'points',
        criteria_value: 1000,
        icon: 'military_tech'
      },
      {
        title: 'Challenge Starter',
        description: 'Complete your first challenge',
        points: 50,
        criteria_type: 'challenges',
        criteria_value: 1,
        icon: 'flag'
      },
      {
        title: 'Challenge Master',
        description: 'Complete 5 challenges',
        points: 200,
        criteria_type: 'challenges',
        criteria_value: 5,
        icon: 'workspace_premium'
      },
      {
        title: 'Carbon Reducer',
        description: 'Reduce your carbon footprint by 20%',
        points: 300,
        criteria_type: 'carbon_reduction',
        criteria_value: 20,
        icon: 'trending_down'
      }
    ];

    for (const achievement of achievements) {
      const existingAchievement = await query('SELECT * FROM achievements WHERE title = ?', [achievement.title]);
      
      if (existingAchievement.length === 0) {
        await query(
          `INSERT INTO achievements (title, description, points, criteria_type, criteria_value, icon) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [achievement.title, achievement.description, achievement.points, achievement.criteria_type, achievement.criteria_value, achievement.icon]
        );
        console.log(`Added achievement: ${achievement.title}`);
      } else {
        console.log(`Achievement "${achievement.title}" already exists`);
      }
    }

    const firstChallenge = await query('SELECT id FROM challenges LIMIT 1');
    if (firstChallenge.length > 0) {
      const challengeId = firstChallenge[0].id;
      const userId = 1;
      
      const existingJoin = await query('SELECT * FROM user_challenges WHERE user_id = ? AND challenge_id = ?', [userId, challengeId]);
      if (existingJoin.length === 0) {
        await query(
          'INSERT INTO user_challenges (user_id, challenge_id, progress) VALUES (?, ?, ?)',
          [userId, challengeId, 50] 
        );
        console.log(`User ${userId} joined challenge ${challengeId} with 50% progress`);
      }
    }

    const firstAchievement = await query('SELECT id FROM achievements LIMIT 1');
    if (firstAchievement.length > 0) {
      const achievementId = firstAchievement[0].id;
      const userId = 2;
      
      const existingAward = await query('SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?', [userId, achievementId]);
      if (existingAward.length === 0) {
        await query(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [userId, achievementId]
        );
        console.log(`User ${userId} earned achievement ${achievementId}`);
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seedDatabase(); 