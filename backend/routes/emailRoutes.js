const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');
const auth = require('../middleware/auth');

// Get current user's email preferences
router.get('/preferences', auth, emailController.getEmailPreferences);

// Update email preferences
router.put('/preferences', auth, emailController.updateEmailPreferences);

// Send a test email (for development and user testing)
router.post('/test', auth, async (req, res) => {
  try {
    const { emailType } = req.body;
    const userId = req.user.id;
    
    console.log(`Received test email request for type: ${emailType}`);
    
    if (!emailType) {
      console.log('No email type provided');
      return res.status(400).json({
        success: false,
        error: 'Email type is required'
      });
    }
    
    let result;
    
    const validTypes = [
      'weeklyReport', 'milestoneAlert', 'suggestionEmail', 
      'challengeReminder', 'achievementUnlocked', 'newChallengeAlert', 
      'weeklyEcoTips', 'educationalContent', 'localEvents'
    ];
    
    if (!validTypes.includes(emailType)) {
      console.log(`Invalid email type: ${emailType}`);
      return res.status(400).json({
        success: false,
        error: `Invalid email type. Valid types are: ${validTypes.join(', ')}`
      });
    }
    
    switch (emailType) {
      case 'weeklyReport':
        result = await emailController.sendWeeklyReport(userId);
        break;
      case 'milestoneAlert':
        result = await emailController.sendMilestoneAlert(userId, 'firstReduction');
        break;
      case 'suggestionEmail':
        result = await emailController.sendSuggestionEmail(userId);
        break;
      case 'challengeReminder':
        result = await emailController.sendChallengeReminder(userId);
        break;
      case 'achievementUnlocked':
        result = await emailController.sendAchievementUnlocked(userId, 'challenge-complete');
        break;
      case 'newChallengeAlert':
        result = await emailController.sendNewChallengeAlert(userId);
        break;
      case 'weeklyEcoTips':
        result = await emailController.sendWeeklyEcoTips(userId);
        break;
      case 'educationalContent':
        result = await emailController.sendEducationalContent(userId);
        break;
      case 'localEvents':
        result = await emailController.sendLocalEvents(userId);
        break;
    }
    
    console.log('Email send result:', result);
    
    if (result) {
      if (result.success === false) {
        const errorMessage = result.error || 'Failed to send test email';
        console.log('Email sending failed:', errorMessage);
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }
      
      if (result.accepted && result.accepted.length > 0) {
        return res.status(200).json({
          success: true,
          message: `Test ${emailType} email sent successfully`
        });
      }
      
      return res.status(200).json({
        success: true,
        message: `Test ${emailType} email sent successfully`
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'No result from email service'
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
});

module.exports = router; 