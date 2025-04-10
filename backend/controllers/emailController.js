const EmailPreference = require('../models/EmailPreference');
const User = require('../models/User');
const CarbonFootprint = require('../models/carbonFootprintModel');
const Challenge = require('../models/Challenge');
const emailService = require('../services/emailService');
const CarbonData = require('../models/carbonDataModel');

/**
 * Update email preferences for a user
 */
exports.updateEmailPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;
    
    // Find or create preferences
    let emailPreference = await EmailPreference.findOne({ userId });
    
    if (!emailPreference) {
      emailPreference = await EmailPreference.createDefaultPreferences(userId);
    }
    
    // Update preferences with request data
    Object.keys(preferences).forEach(key => {
      if (emailPreference[key] !== undefined) {
        emailPreference[key] = preferences[key];
      }
    });
    
    await emailPreference.save();
    
    res.status(200).json({
      success: true,
      data: emailPreference
    });
  } catch (error) {
    console.error('Error updating email preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get email preferences for a user
 */
exports.getEmailPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find or create preferences
    let emailPreference = await EmailPreference.findOne({ userId });
    
    if (!emailPreference) {
      emailPreference = await EmailPreference.createDefaultPreferences(userId);
    }
    
    res.status(200).json({
      success: true,
      data: emailPreference
    });
  } catch (error) {
    console.error('Error getting email preferences:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Send a weekly carbon footprint report to a user
 */
exports.sendWeeklyReport = async (userId) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.log('User not found or has no email');
      return { success: false, error: 'User not found or has no email' };
    }
    
    // Get user email preferences
    const emailPreference = await EmailPreference.findOne({ userId });
    if (!emailPreference || !emailPreference.weeklyReport) {
      console.log('User has disabled weekly reports');
      return { success: false, error: 'User has disabled weekly reports' };
    }
    
    // Get carbon footprint data for past weeks
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    // Try to fetch from CarbonData first
    let currentWeekData = [];
    let previousWeekData = [];
    
    try {
      // Get real carbon data from CarbonData model
      currentWeekData = await CarbonData.find({
        userId,
        date: { $gte: oneWeekAgo, $lte: now }
      }).sort({ date: -1 });
      
      previousWeekData = await CarbonData.find({
        userId,
        date: { $gte: twoWeeksAgo, $lte: oneWeekAgo }
      }).sort({ date: -1 });
      
      console.log(`Found ${currentWeekData.length} current week entries and ${previousWeekData.length} previous week entries from CarbonData`);
      
      // If no data from CarbonData, fall back to CarbonFootprint
      if (currentWeekData.length === 0) {
        currentWeekData = await CarbonFootprint.find({
          userId,
          createdAt: { $gte: oneWeekAgo, $lte: now }
        }).sort({ createdAt: -1 });
        
        previousWeekData = await CarbonFootprint.find({
          userId,
          createdAt: { $gte: twoWeeksAgo, $lte: oneWeekAgo }
        }).sort({ createdAt: -1 });
        
        console.log(`Found ${currentWeekData.length} current week entries and ${previousWeekData.length} previous week entries from CarbonFootprint`);
      }
    } catch (error) {
      console.error('Error fetching carbon data:', error);
      // Fall back to CarbonFootprint if CarbonData fetch fails
      currentWeekData = await CarbonFootprint.find({
        userId,
        createdAt: { $gte: oneWeekAgo, $lte: now }
      }).sort({ createdAt: -1 });
      
      previousWeekData = await CarbonFootprint.find({
        userId,
        createdAt: { $gte: twoWeeksAgo, $lte: oneWeekAgo }
      }).sort({ createdAt: -1 });
    }
    
    // Calculate aggregates
    // CarbonData model uses totalFootprint, CarbonFootprint model uses totalEmissions
    const currentWeekTotal = currentWeekData.reduce((total, record) => 
      total + (record.totalFootprint || record.totalEmissions || 0), 0);
    
    const previousWeekTotal = previousWeekData.reduce((total, record) => 
      total + (record.totalFootprint || record.totalEmissions || 0), 0);
    
    // Calculate change percentage
    let changePercentage = 0;
    let emissionsChange = '0.0%';
    let emissionsChangeColor = '#4CAF50'; // Default to green
    
    if (previousWeekTotal > 0) {
      changePercentage = ((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100;
      emissionsChange = `${changePercentage > 0 ? '+' : ''}${changePercentage.toFixed(1)}%`;
      emissionsChangeColor = changePercentage < 0 ? '#4CAF50' : '#f44336';
    } else if (currentWeekTotal > 0) {
      // If no previous data but current data exists, show as new data
      emissionsChange = "New data";
      emissionsChangeColor = "#2196F3"; // Blue for new data
    } else {
      // If no data at all, show as baseline
      emissionsChange = "Baseline";
      emissionsChangeColor = "#757575"; // Gray for baseline
    }
    
    // Get user's weekly goal or use a default
    const weeklyGoal = user.weeklyGoal || 100; // Default goal if not set
    
    // Calculate goal progress percentage
    const goalProgress = Math.min(100, Math.max(0, (currentWeekTotal / weeklyGoal) * 100)).toFixed(0);
    
    // Use actual data if available, otherwise use sample data
    const hasRealData = currentWeekData.length > 0;
    const dataForTips = hasRealData ? currentWeekData : generateSampleData();
    const displayTotal = hasRealData ? currentWeekTotal : 0;
    
    // Prepare data for the email
    const userData = {
      name: user.fullname?.firstname || user.username || 'User',
      totalEmissions: displayTotal.toFixed(2),
      emissionsChange: emissionsChange,
      emissionsChangeColor: emissionsChangeColor,
      goalProgress: goalProgress,
      tips: generateTips(dataForTips),
      dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      hasData: hasRealData
    };
    
    console.log('Sending weekly report with data:', JSON.stringify(userData, null, 2));
    
    // Send the email
    const result = await emailService.sendWeeklyReport(user, userData);
    
    // Update the last sent timestamp if email was sent successfully
    if (result && result.success) {
      await emailPreference.updateSentTimestamp('weeklyReport');
      return result; // Return the result with success: true
    } else {
      console.log('Email service did not report success:', result);
      return { 
        success: false, 
        error: result?.error || 'Failed to send email'
      };
    }
  } catch (error) {
    console.error('Error sending weekly report:', error);
    return { success: false, error: error.message || 'An unknown error occurred' };
  }
};

/**
 * Generate sample data for testing
 */
const generateSampleData = () => {
  const now = new Date();
  return [
    {
      categories: {
        transportation: 2.5,
        energy: 1.8,
        food: 3.2,
        waste: 0.9
      },
      totalEmissions: 8.4,
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      categories: {
        transportation: 3.1,
        energy: 1.5,
        food: 2.9,
        waste: 1.1
      },
      totalEmissions: 8.6,
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    }
  ];
};

/**
 * Send a milestone alert when a user reaches a carbon reduction goal
 */
exports.sendMilestoneAlert = async (userId, milestoneType) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return { success: false, error: 'User not found or has no email' };
    }
    
    // Get user email preferences
    const emailPreference = await EmailPreference.findOne({ userId });
    if (!emailPreference || !emailPreference.milestoneAlerts) {
      return { success: false, error: 'User has disabled milestone alerts' };
    }
    
    // Define milestone data based on type
    const milestones = {
      firstReduction: {
        title: 'First Carbon Reduction',
        description: 'You\'ve reduced your carbon footprint for the first time!',
        achievement: 'Your actions are making a difference.',
        nextSteps: 'Keep tracking your activities to see more reductions over time.'
      },
      tenPercentReduction: {
        title: '10% Carbon Reduction',
        description: 'You\'ve reduced your carbon footprint by 10% compared to your baseline!',
        achievement: 'This reduction is equivalent to planting several trees.',
        nextSteps: 'Try our challenges to reduce your footprint even further.'
      },
      twentyPercentReduction: {
        title: '20% Carbon Reduction',
        description: 'You\'ve reduced your carbon footprint by 20% compared to your baseline!',
        achievement: 'You\'re making a significant environmental impact.',
        nextSteps: 'Share your achievements with the community to inspire others.'
      },
      consistentReduction: {
        title: 'Consistent Reduction Champion',
        description: 'You\'ve reduced your carbon footprint consistently for 4 weeks!',
        achievement: 'Your sustainable habits are becoming part of your lifestyle.',
        nextSteps: 'Check out our advanced sustainability tips to continue your journey.'
      }
    };
    
    const milestoneData = {
      name: user.fullname?.firstname || user.username,
      ...milestones[milestoneType],
      dateAchieved: new Date().toLocaleDateString()
    };
    
    // Send the email
    const result = await emailService.sendMilestoneAlert(user.email, milestoneData);
    
    // Update the last sent timestamp
    if (result.success) {
      await emailPreference.updateSentTimestamp('milestoneAlert');
    }
    
    return result;
  } catch (error) {
    console.error('Error sending milestone alert:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send personalized carbon reduction suggestions
 */
exports.sendSuggestionEmail = async (userId) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return { success: false, error: 'User not found or has no email' };
    }
    
    // Get user email preferences
    const emailPreference = await EmailPreference.findOne({ userId });
    if (!emailPreference || !emailPreference.suggestionEmails) {
      return { success: false, error: 'User has disabled suggestion emails' };
    }
    
    // Get the user's latest carbon footprint data
    const latestFootprints = await CarbonFootprint.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    if (latestFootprints.length === 0) {
      return { success: false, error: 'No carbon footprint data found for user' };
    }
    
    // Analyze the data to find the categories with highest emissions
    const categoryTotals = {};
    
    latestFootprints.forEach(footprint => {
      Object.entries(footprint.categories || {}).forEach(([category, value]) => {
        categoryTotals[category] = (categoryTotals[category] || 0) + value;
      });
    });
    
    // Sort categories by emission value in descending order
    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);
    
    // Get the top 3 categories
    const topCategories = sortedCategories.slice(0, 3);
    
    // Generate suggestions based on top categories
    const suggestions = topCategories.map(category => ({
      category,
      tips: getSuggestionsByCategory(category)
    }));
    
    const suggestionData = {
      name: user.fullname?.firstname || user.username,
      suggestions,
      generalTip: 'Remember, small changes add up to make a big difference for our planet!'
    };
    
    // Send the email
    const result = await emailService.sendSuggestionEmail(user.email, suggestionData);
    
    // Update the last sent timestamp
    if (result.success) {
      await emailPreference.updateSentTimestamp('suggestionEmail');
    }
    
    return result;
  } catch (error) {
    console.error('Error sending suggestion email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send challenge reminder for challenges nearing deadline
 */
exports.sendChallengeReminder = async (userId) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return { success: false, error: 'User not found or has no email' };
    }
    
    // Get user email preferences
    const emailPreference = await EmailPreference.findOne({ userId });
    if (!emailPreference || !emailPreference.challengeReminders) {
      return { success: false, error: 'User has disabled challenge reminders' };
    }
    
    // Find user's active challenges that are ending soon (within 2 days)
    const now = new Date();
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    const endingSoonChallenges = await Challenge.find({
      'participants.userId': userId,
      endDate: { $gte: now, $lte: twoDaysFromNow },
      'participants.completed': false
    });
    
    if (endingSoonChallenges.length === 0) {
      return { success: false, error: 'No challenges ending soon' };
    }
    
    const challengeData = {
      name: user.fullname?.firstname || user.username,
      challenges: endingSoonChallenges.map(challenge => ({
        title: challenge.title,
        description: challenge.description,
        endDate: challenge.endDate.toLocaleDateString(),
        hoursRemaining: Math.round((challenge.endDate - now) / (1000 * 60 * 60)),
        progress: calculateChallengeProgress(challenge, userId)
      }))
    };
    
    // Send the email
    const result = await emailService.sendChallengeReminder(user.email, challengeData);
    
    // Update the last sent timestamp
    if (result.success) {
      await emailPreference.updateSentTimestamp('challengeReminder');
    }
    
    return result;
  } catch (error) {
    console.error('Error sending challenge reminder:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send achievement unlocked notification
 */
exports.sendAchievementUnlocked = async (userId, achievementId) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.email) {
      console.log('User not found or has no email');
      return { success: false, error: 'User not found or has no email' };
    }
    
    // Get user email preferences
    const emailPreference = await EmailPreference.findOne({ userId });
    if (!emailPreference || !emailPreference.achievementNotifications) {
      console.log('User has disabled achievement notifications');
      return { success: false, error: 'User has disabled achievement notifications' };
    }
    
    // Sample achievement data - in a real implementation, you would fetch this from your database
    const achievements = {
      'challenge-complete': {
        title: 'Challenge Champion',
        description: 'You successfully completed a sustainability challenge!',
        impact: 'By completing this challenge, you\'ve helped reduce carbon emissions and inspired others.',
        nextMilestone: 'Complete 5 challenges to become a Sustainability Master.',
        icon: '🏆'
      },
      'streak-week': {
        title: 'Week Streak Master',
        description: 'You\'ve logged your carbon footprint for 7 consecutive days!',
        impact: 'Consistent tracking helps build sustainable habits for long-term change.',
        nextMilestone: 'Maintain your streak for a month to reach the next level.',
        icon: '📊'
      },
      'community-contributor': {
        title: 'Community Contributor',
        description: 'You\'ve made 10 helpful contributions to the community!',
        impact: 'Your insights and support help others on their sustainability journey.',
        nextMilestone: 'Make 25 contributions to become a Community Leader.',
        icon: '👥'
      }
    };
    
    if (!achievements[achievementId]) {
      console.log(`Invalid achievement ID: ${achievementId}`);
      return { success: false, error: 'Invalid achievement ID' };
    }
    
    const achievementData = {
      name: user.fullname?.firstname || user.username || 'User',
      achievementIcon: achievements[achievementId].icon || '🌟',
      achievementName: achievements[achievementId].title,
      achievementDescription: achievements[achievementId].description,
      achievementImpact: achievements[achievementId].impact,
      nextMilestone: achievements[achievementId].nextMilestone,
      dateEarned: new Date().toLocaleDateString(),
      dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/achievements`
    };
    
    console.log('Sending achievement notification with data:', JSON.stringify(achievementData, null, 2));
    
    // Send the email
    const result = await emailService.sendAchievementUnlocked(user, achievementData);
    
    // Update the last sent timestamp if email was sent successfully
    if (result && result.success) {
      await emailPreference.updateSentTimestamp('achievementUnlocked');
      return result; // Return the result with success: true
    } else {
      console.log('Email service did not report success:', result);
      return { 
        success: false, 
        error: result?.error || 'Failed to send email'
      };
    }
  } catch (error) {
    console.error('Error sending achievement notification:', error);
    return { success: false, error: error.message || 'An unknown error occurred' };
  }
};

/**
 * Send new challenge alerts
 */
exports.sendNewChallengeAlert = async (userId) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return { success: false, error: 'User not found or has no email' };
    }
    
    // Get user email preferences
    const emailPreference = await EmailPreference.findOne({ userId });
    if (!emailPreference || !emailPreference.newChallengeAlerts) {
      return { success: false, error: 'User has disabled new challenge alerts' };
    }
    
    // Get user's interests (this would be implemented in your user model)
    // For now, we'll use a sample implementation
    const userInterests = user.interests || ['transportation', 'energy', 'food', 'recycling'];
    
    // Find new challenges in the past 7 days that match user interests
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const newChallenges = await Challenge.find({
      createdAt: { $gte: oneWeekAgo },
      category: { $in: userInterests },
      'participants.userId': { $ne: userId } // Exclude challenges user already joined
    }).limit(5);
    
    if (newChallenges.length === 0) {
      return { success: false, error: 'No new matching challenges found' };
    }
    
    const newChallengeData = {
      name: user.fullname?.firstname || user.username,
      challenges: newChallenges.map(challenge => ({
        id: challenge._id,
        title: challenge.title,
        description: challenge.description,
        category: challenge.category,
        difficulty: challenge.difficulty,
        startDate: challenge.startDate.toLocaleDateString(),
        endDate: challenge.endDate.toLocaleDateString(),
        participantCount: challenge.participants.length
      }))
    };
    
    // Send the email
    const result = await emailService.sendNewChallengeAlert(user.email, newChallengeData);
    
    // Update the last sent timestamp
    if (result.success) {
      await emailPreference.updateSentTimestamp('newChallengeAlert');
    }
    
    return result;
  } catch (error) {
    console.error('Error sending new challenge alert:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send weekly eco-tips
 */
exports.sendWeeklyEcoTips = async (userId) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return { success: false, error: 'User not found or has no email' };
    }
    
    // Get user email preferences
    const emailPreference = await EmailPreference.findOne({ userId });
    if (!emailPreference || !emailPreference.weeklyEcoTips) {
      return { success: false, error: 'User has disabled weekly eco-tips' };
    }
    
    // Get the user's latest carbon footprint data to personalize tips
    let latestFootprint = null;
    let hasData = false;
    
    try {
      // Try to get the latest data from CarbonData first
      latestFootprint = await CarbonData.findOne({ userId })
        .sort({ date: -1 });
      
      if (!latestFootprint) {
        // Fall back to CarbonFootprint model
        latestFootprint = await CarbonFootprint.findOne({ userId })
          .sort({ createdAt: -1 });
      }
      
      hasData = !!latestFootprint;
      console.log(`Found ${hasData ? 'real' : 'no'} footprint data for user ${userId}`);
    } catch (error) {
      console.error('Error fetching carbon data for eco-tips:', error);
    }
    
    // Create sample data if no data exists for testing purposes
    const sampleFootprint = {
      categories: {
        transportation: 2.5,
        energy: 2.8,
        food: 1.9,
        waste: 0.8
      },
      totalEmissions: 8.0,
      createdAt: new Date()
    };
    
    // Generate eco-tips based on user's footprint or use sample data
    const footprintForTips = hasData ? latestFootprint : sampleFootprint;
    const ecoTips = generateTipsFromFootprint(footprintForTips);
    
    const tipsData = {
      name: user.fullname?.firstname || user.username || 'User',
      weekOf: new Date().toLocaleDateString(),
      tips: formatTipsForTemplate(ecoTips),
      fact: getRandomSustainabilityFact(),
      hasData: hasData,
      frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000'
    };
    
    // Send the email
    const result = await emailService.sendWeeklyEcoTips(user, tipsData);
    
    // Update the last sent timestamp if email was sent successfully
    if (result && result.success) {
      await emailPreference.updateSentTimestamp('weeklyEcoTips');
      return result; // Return the result with success: true
    } else {
      console.log('Email service did not report success:', result);
      return { 
        success: false, 
        error: result?.error || 'Failed to send email'
      };
    }
  } catch (error) {
    console.error('Error sending weekly eco-tips:', error);
    return { success: false, error: error.message || 'An unknown error occurred' };
  }
};

/**
 * Send educational content
 */
exports.sendEducationalContent = async (userId) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return { success: false, error: 'User not found or has no email' };
    }
    
    // Get user email preferences
    const emailPreference = await EmailPreference.findOne({ userId });
    if (!emailPreference || !emailPreference.educationalContent) {
      return { success: false, error: 'User has disabled educational content' };
    }
    
    // In a real implementation, you would select content based on user preferences and history
    // For now, we'll use a sample implementation with rotating topics
    const topics = [
      {
        topic: 'Understanding Carbon Footprint',
        title: 'The Science Behind Carbon Emissions',
        content: 'Carbon emissions refer to the release of carbon dioxide into the atmosphere...',
        image: 'carbon-science.jpg',
        readMoreUrl: 'https://ecotrack.com/learn/carbon-science'
      },
      {
        topic: 'Sustainable Transportation',
        title: 'Electric Vehicles vs. Public Transit: A Comparison',
        content: 'When comparing different transportation options for sustainability...',
        image: 'transportation.jpg',
        readMoreUrl: 'https://ecotrack.com/learn/transportation'
      },
      {
        topic: 'Renewable Energy',
        title: 'Solar, Wind, and Hydro: Powering Your Home Sustainably',
        content: 'Renewable energy sources are becoming increasingly accessible...',
        image: 'renewable-energy.jpg',
        readMoreUrl: 'https://ecotrack.com/learn/renewable-energy'
      }
    ];
    
    // Select a random topic for this email
    const contentData = {
      name: user.fullname?.firstname || user.username,
      ...topics[Math.floor(Math.random() * topics.length)],
      sentDate: new Date().toLocaleDateString()
    };
    
    // Send the email
    const result = await emailService.sendEducationalContent(user.email, contentData);
    
    // Update the last sent timestamp
    if (result.success) {
      await emailPreference.updateSentTimestamp('educationalContent');
    }
    
    return result;
  } catch (error) {
    console.error('Error sending educational content:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send local events information
 */
exports.sendLocalEvents = async (userId) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    if (!user || !user.email) {
      return { success: false, error: 'User not found or has no email' };
    }
    
    // Get user email preferences
    const emailPreference = await EmailPreference.findOne({ userId });
    if (!emailPreference || !emailPreference.localEvents) {
      return { success: false, error: 'User has disabled local events notifications' };
    }
    
    // In a real implementation, you would fetch events from a database or external API based on location
    // For now, we'll use sample events
    const events = [
      {
        title: 'Community Tree Planting Day',
        description: 'Join your neighbors in planting trees at the local park.',
        date: '2023-11-15',
        time: '9:00 AM - 12:00 PM',
        location: 'City Park, Main Entrance',
        registrationUrl: 'https://ecotrack.com/events/tree-planting'
      },
      {
        title: 'Sustainability Workshop: Home Energy Efficiency',
        description: 'Learn practical ways to reduce your home energy consumption.',
        date: '2023-11-20',
        time: '6:30 PM - 8:00 PM',
        location: 'Community Center, Room 203',
        registrationUrl: 'https://ecotrack.com/events/energy-workshop'
      },
      {
        title: 'Farmers Market: Local Produce Festival',
        description: 'Celebrate local farmers and reduce food miles by buying local.',
        date: '2023-11-25',
        time: '10:00 AM - 3:00 PM',
        location: 'Downtown Square',
        registrationUrl: 'https://ecotrack.com/events/farmers-market'
      }
    ];
    
    const eventsData = {
      name: user.fullname?.firstname || user.username,
      location: user.location || 'your area',
      events: events,
      month: new Date().toLocaleString('default', { month: 'long' })
    };
    
    // Send the email
    const result = await emailService.sendLocalEvents(user.email, eventsData);
    
    // Update the last sent timestamp
    if (result.success) {
      await emailPreference.updateSentTimestamp('localEvents');
    }
    
    return result;
  } catch (error) {
    console.error('Error sending local events information:', error);
    return { success: false, error: error.message };
  }
};

// Helper functions

/**
 * Calculate the progress of a challenge for a user
 */
const calculateChallengeProgress = (challenge, userId) => {
  const userParticipant = challenge.participants.find(p => p.userId.toString() === userId.toString());
  
  if (!userParticipant) {
    return 0;
  }
  
  return userParticipant.progress || 0;
};

/**
 * Generate tips based on carbon footprint data
 */
const generateTips = (footprintData) => {
  if (!footprintData || footprintData.length === 0) {
    return formatTipsForTemplate(getGeneralEcoTips());
  }
  
  // Identify categories with highest emissions
  const categoryTotals = {};
  
  footprintData.forEach(footprint => {
    Object.entries(footprint.categories || {}).forEach(([category, value]) => {
      categoryTotals[category] = (categoryTotals[category] || 0) + value;
    });
  });
  
  // Get the highest emission category
  const highestCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)[0];
  
  return formatTipsForTemplate(getSuggestionsByCategory(highestCategory));
};

/**
 * Format tips for email template
 */
const formatTipsForTemplate = (tips) => {
  return tips.map(tip => ({
    title: tip.category || 'Sustainability Tip',
    description: `${tip.tip}${tip.impact ? ` - ${tip.impact}` : ''}`
  }));
};

/**
 * Generate tips from a single footprint record
 */
const generateTipsFromFootprint = (footprint) => {
  if (!footprint) {
    return getGeneralEcoTips();
  }
  
  // Handle both CarbonData and CarbonFootprint models
  // CarbonData stores categories directly, CarbonFootprint stores them in categories object
  let categories = {};
  
  if (footprint.categories) {
    // CarbonFootprint model
    categories = footprint.categories;
  } else if (footprint.transportation || footprint.energy || footprint.food || footprint.waste) {
    // CarbonData model
    categories = {
      transportation: calculateCategoryTotal(footprint.transportation),
      energy: calculateCategoryTotal(footprint.energy),
      food: calculateCategoryTotal(footprint.food),
      waste: calculateCategoryTotal(footprint.waste)
    };
  } else {
    return getGeneralEcoTips();
  }
  
  // Get the highest emission category
  const highestCategory = Object.entries(categories)
    .filter(([_, value]) => value && !isNaN(value)) // Filter out null/undefined/NaN values
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category)[0];
  
  return highestCategory ? getSuggestionsByCategory(highestCategory) : getGeneralEcoTips();
};

/**
 * Calculate total emissions for a category
 */
const calculateCategoryTotal = (categoryData) => {
  if (!categoryData) return 0;
  
  // If it's already a number, return it
  if (typeof categoryData === 'number') return categoryData;
  
  // If it's an object, sum all numeric properties
  if (typeof categoryData === 'object') {
    return Object.values(categoryData)
      .filter(val => typeof val === 'number')
      .reduce((sum, val) => sum + val, 0);
  }
  
  return 0;
};

/**
 * Get suggestions by category
 */
const getSuggestionsByCategory = (category) => {
  const suggestions = {
    transportation: [
      { tip: 'Consider carpooling with coworkers to reduce commute emissions', impact: 'Can cut your transportation footprint by 50%' },
      { tip: 'Try using public transit once per week instead of driving', impact: 'Saves approximately 20 pounds of CO2 per day' },
      { tip: 'Keep your tires properly inflated to improve fuel efficiency', impact: 'Improves fuel economy by up to 3%' },
      { tip: 'Plan errands efficiently to combine trips and reduce mileage', impact: 'Can reduce transportation emissions by 10-15%' }
    ],
    energy: [
      { tip: 'Switch to LED bulbs throughout your home', impact: 'Uses 75% less energy than incandescent lighting' },
      { tip: 'Unplug electronics when not in use to prevent "phantom power" use', impact: 'Can save up to 10% on electricity bills' },
      { tip: 'Use a programmable thermostat to optimize heating and cooling', impact: 'Can reduce related energy use by 10-15%' },
      { tip: 'Wash clothes in cold water instead of hot', impact: 'Saves up to 90% of the energy used for laundry' }
    ],
    food: [
      { tip: 'Try having one meatless day per week', impact: 'Can reduce your food carbon footprint by up to 15%' },
      { tip: 'Buy locally grown, seasonal produce', impact: 'Reduces transportation emissions and supports local economy' },
      { tip: 'Plan meals to reduce food waste', impact: 'Food waste accounts for 8% of global emissions' },
      { tip: 'Compost food scraps instead of sending to landfill', impact: 'Prevents methane emissions from decomposing food' }
    ],
    waste: [
      { tip: 'Use reusable shopping bags, water bottles, and coffee cups', impact: 'Prevents single-use plastics from entering landfills' },
      { tip: 'Start a simple recycling system in your home', impact: 'Recycling aluminum saves 95% of the energy used to make new cans' },
      { tip: 'Buy products with minimal packaging', impact: 'Packaging accounts for about 30% of household waste' },
      { tip: 'Repair items instead of replacing them', impact: 'Extends product lifecycles and reduces manufacturing emissions' }
    ]
  };
  
  // Return tips for the category or general tips if category not found
  return suggestions[category] || getGeneralEcoTips();
};

/**
 * Get general eco-tips for when specific data isn't available
 */
const getGeneralEcoTips = () => [
  { tip: 'Install a smart thermostat to optimize heating and cooling', impact: 'Can save 10-15% on heating and cooling costs' },
  { tip: 'Use reusable water bottles instead of disposable plastic', impact: 'Prevents hundreds of plastic bottles from landfills annually' },
  { tip: 'Switch to paperless billing for all your accounts', impact: 'Saves trees and reduces carbon footprint from paper production' },
  { tip: 'Grow some of your own vegetables at home', impact: 'Reduces emissions from food transportation and packaging' }
];

/**
 * Get a random sustainability fact
 */
const getRandomSustainabilityFact = () => {
  const facts = [
    'Recycling one aluminum can saves enough energy to run a TV for three hours.',
    'The average American produces about 4.4 pounds of trash per day.',
    'It takes 450 years for a plastic bottle to decompose in a landfill.',
    'A typical passenger vehicle emits about 4.6 metric tons of carbon dioxide per year.',
    'About 9 million tons of plastic waste enters our oceans every year.',
    'Energy-efficient LED bulbs use up to 80% less energy than traditional incandescent bulbs.',
    'The world\'s food waste accounts for 8% of global greenhouse gas emissions.',
    'The fashion industry produces 10% of all humanity\'s carbon emissions.',
    'Almost 50% of the world\'s electricity will come from renewable energy by 2050.'
  ];
  
  return facts[Math.floor(Math.random() * facts.length)];
};