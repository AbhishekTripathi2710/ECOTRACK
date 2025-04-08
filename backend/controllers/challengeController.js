const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Get all challenges
exports.getAllChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find()
      .populate('participants.user', 'username')
      .lean();

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ message: 'Error fetching challenges' });
  }
};

// Create a new challenge
exports.createChallenge = async (req, res) => {
  try {
    const { title, description, points, startDate, endDate } = req.body;

    const challenge = new Challenge({
      title,
      description,
      points,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    await challenge.save();
    res.status(201).json(challenge);
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ message: 'Error creating challenge' });
  }
};

// Join a challenge
exports.joinChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if challenge is active
    if (!challenge.isActive()) {
      return res.status(400).json({ message: 'Challenge is not active' });
    }

    // Check if user is already participating
    const isParticipating = challenge.participants.some(
      participant => participant.user.toString() === userId
    );

    if (isParticipating) {
      return res.status(400).json({ message: 'User is already participating in this challenge' });
    }

    // Add user to participants
    challenge.participants.push({
      user: userId,
      progress: 0
    });

    await challenge.save();

    // Add challenge to user's challenges
    await User.findByIdAndUpdate(userId, {
      $push: {
        challenges: {
          challenge: challengeId,
          progress: 0
        }
      }
    });

    res.json({ message: 'Successfully joined challenge' });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ message: 'Error joining challenge' });
  }
};

// Update challenge progress
exports.updateChallengeProgress = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { userId, progress } = req.body;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Find the participant
    const participant = challenge.participants.find(
      p => p.user.toString() === userId
    );

    if (!participant) {
      return res.status(404).json({ message: 'User is not participating in this challenge' });
    }

    // Update progress
    participant.progress = progress;

    // Check if challenge is completed
    if (progress >= 100) {
      // Award points to the user
      const user = await User.findById(userId);
      user.points += challenge.points;
      await user.save();

      // Update challenge status if all participants have completed it
      const allCompleted = challenge.participants.every(p => p.progress >= 100);
      if (allCompleted) {
        challenge.status = 'completed';
      }
    }

    await challenge.save();

    // Update user's challenge progress
    await User.updateOne(
      { 
        _id: userId,
        'challenges.challenge': challengeId
      },
      {
        $set: {
          'challenges.$.progress': progress
        }
      }
    );

    res.json({ message: 'Progress updated successfully' });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({ message: 'Error updating challenge progress' });
  }
}; 