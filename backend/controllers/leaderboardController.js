const User = require('../models/User');

// Get top users for a specific period
exports.getTopUsers = async (req, res) => {
  try {
    const { period = 'weekly', limit = 10 } = req.query;
    const now = new Date();
    let startDate;

    // Calculate start date based on period
    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'monthly':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'all':
        startDate = new Date(0); // Beginning of time
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7)); // Default to weekly
    }

    const topUsers = await User.find({
      updatedAt: { $gte: startDate }
    })
      .sort({ points: -1 })
      .limit(parseInt(limit))
      .select('username points rank')
      .lean();

    res.json(topUsers);
  } catch (error) {
    console.error('Error fetching top users:', error);
    res.status(500).json({ message: 'Error fetching top users' });
  }
};

// Get user's rank
exports.getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('points rank').lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      rank: user.rank,
      points: user.points
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ message: 'Error fetching user rank' });
  }
};

// Update user points
exports.updateUserPoints = async (req, res) => {
  try {
    const { userId, points } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.points += points;
    await user.save();

    // Update ranks for all users
    await updateAllUserRanks();

    res.json({
      message: 'Points updated successfully',
      newPoints: user.points,
      newRank: user.rank
    });
  } catch (error) {
    console.error('Error updating user points:', error);
    res.status(500).json({ message: 'Error updating user points' });
  }
};

// Helper function to update ranks for all users
async function updateAllUserRanks() {
  try {
    const users = await User.find().sort({ points: -1 });
    
    for (let i = 0; i < users.length; i++) {
      users[i].rank = i + 1;
      await users[i].save();
    }
  } catch (error) {
    console.error('Error updating user ranks:', error);
    throw error;
  }
} 