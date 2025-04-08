const Achievement = require('../models/Achievement');
const User = require('../models/User');

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
    const user = await User.findById(userId)
      .populate('achievements')
      .select('achievements')
      .lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user.achievements);
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ message: 'Error fetching user achievements' });
  }
};

// Check and award achievements
exports.checkAchievements = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const achievements = await Achievement.find();
    const newlyUnlockedAchievements = [];

    for (const achievement of achievements) {
      // Skip if user already has this achievement
      if (user.achievements.includes(achievement._id)) {
        continue;
      }

      // Check if user meets the criteria
      if (achievement.checkCriteria(user)) {
        // Add achievement to user's achievements
        user.achievements.push(achievement._id);
        
        // Award points
        user.points += achievement.points;
        
        newlyUnlockedAchievements.push(achievement);
      }
    }

    if (newlyUnlockedAchievements.length > 0) {
      await user.save();
    }

    res.json({
      message: 'Achievements checked successfully',
      newlyUnlocked: newlyUnlockedAchievements
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ message: 'Error checking achievements' });
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