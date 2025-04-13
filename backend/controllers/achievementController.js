const Achievement = require('../models/Achievement');
const User = require('../models/User');
const UserAchievement = require('../models/UserAchievement');
const mongoose = require('mongoose');

// Get all achievements
exports.getAllAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find().lean();
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Error fetching achievements' });
  }
};

// Get user's achievements
exports.getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Getting achievements for user:', userId);
    
    // Validate userId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error('Invalid userId format:', userId);
      return res.status(400).json({ 
        message: 'Invalid user ID format',
        error: 'INVALID_USER_ID'
      });
    }

    // Check if user exists
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      console.error('User not found:', userId);
      return res.status(404).json({ 
        message: 'User not found',
        error: 'USER_NOT_FOUND'
      });
    }

    try {
      const achievementIds = await UserAchievement.getUserAchievements(userId);
      console.log('Found achievement IDs:', achievementIds);
      
      if (!achievementIds || achievementIds.length === 0) {
        console.log('No achievements found for user:', userId);
        return res.json([]);
      }

      const achievements = await Achievement.find({
        _id: { $in: achievementIds }
      }).lean();

      console.log('Found achievements:', achievements);
      res.json(achievements);
    } catch (dbError) {
      console.error('Database error in getUserAchievements:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ 
      message: 'Error fetching user achievements',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Check and award achievements
exports.checkAchievements = async (req, res) => {
  try {
    const { userId } = req.body;
    console.log('Checking achievements for user:', userId);
    
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User found, current points:', user.points);
    const achievements = await Achievement.find();
    console.log('Found achievements:', achievements.length);
    
    const newlyUnlockedAchievements = [];

    for (const achievement of achievements) {
      try {
        // Skip if user already has this achievement
        const hasAchievement = await UserAchievement.hasAchievement(userId, achievement._id);
        if (hasAchievement) {
          console.log('User already has achievement:', achievement.title);
          continue;
        }

        // Check if user meets the criteria
        console.log(`Checking achievement: ${achievement.title}`);
        console.log('Achievement criteria:', achievement.criteria);
        console.log('User points:', user.points);
        
        const meetsCriteria = await achievement.checkCriteria(user);
        console.log(`Criteria met for ${achievement.title}:`, meetsCriteria);
        
        if (meetsCriteria) {
          try {
            // Add achievement to user's achievements in MySQL
            await UserAchievement.create(userId, achievement._id);
            console.log('Achievement stored in MySQL:', achievement.title);
            
            // Award points
            user.points += achievement.points;
            await user.save();
            console.log('Points updated for user:', user.points);
            
            newlyUnlockedAchievements.push(achievement);
            console.log('Achievement unlocked:', achievement.title);
          } catch (storageError) {
            console.error('Error storing achievement:', storageError);
            // Continue with other achievements even if storage fails
          }
        }
      } catch (error) {
        console.error(`Error checking achievement ${achievement.title}:`, error);
        // Continue with other achievements even if one fails
      }
    }

    res.json({
      success: true,
      message: 'Achievements checked successfully',
      newlyUnlocked: newlyUnlockedAchievements,
      totalAchievements: newlyUnlockedAchievements.length
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error checking achievements',
      error: error.message,
      stack: error.stack
    });
  }
};

// Create a new achievement
exports.createAchievement = async (req, res) => {
  try {
    const { title, description, points, criteria, icon } = req.body;

    const achievement = new Achievement({
      title,
      description,
      points,
      criteria,
      icon
    });

    await achievement.save();
    res.status(201).json(achievement);
  } catch (error) {
    console.error('Error creating achievement:', error);
    res.status(500).json({ message: 'Error creating achievement' });
  }
}; 