const mongoose = require('mongoose');

const EmailPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Carbon Footprint Alerts
  weeklyReport: {
    type: Boolean,
    default: true
  },
  milestoneAlerts: {
    type: Boolean,
    default: true
  },
  suggestionEmails: {
    type: Boolean,
    default: true
  },
  
  // Challenge & Achievement Notifications
  challengeReminders: {
    type: Boolean,
    default: true
  },
  achievementNotifications: {
    type: Boolean,
    default: true
  },
  newChallengeAlerts: {
    type: Boolean,
    default: true
  },
  
  // Sustainability Tips & Education
  weeklyEcoTips: {
    type: Boolean,
    default: true
  },
  educationalContent: {
    type: Boolean,
    default: true
  },
  localEvents: {
    type: Boolean,
    default: true
  },
  
  // Email Frequency Preferences
  emailFrequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly'],
    default: 'immediate'
  },
  
  // Last Email Sent Timestamps (to manage frequency)
  lastWeeklyReportSent: {
    type: Date,
    default: null
  },
  lastMilestoneSent: {
    type: Date,
    default: null
  },
  lastSuggestionSent: {
    type: Date,
    default: null
  },
  lastChallengeReminderSent: {
    type: Date,
    default: null
  },
  lastEcoTipSent: {
    type: Date,
    default: null
  },
  lastEducationalContentSent: {
    type: Date,
    default: null
  },
  lastLocalEventSent: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create default preferences when a user is created
EmailPreferenceSchema.statics.createDefaultPreferences = async function(userId) {
  try {
    const emailPreferences = new this({
      userId: userId
    });
    
    return await emailPreferences.save();
  } catch (error) {
    console.error('Error creating default email preferences:', error);
    throw error;
  }
};

// Update email sent timestamp
EmailPreferenceSchema.methods.updateSentTimestamp = async function(emailType) {
  const timestampFields = {
    weeklyReport: 'lastWeeklyReportSent',
    milestoneAlert: 'lastMilestoneSent',
    suggestionEmail: 'lastSuggestionSent',
    challengeReminder: 'lastChallengeReminderSent',
    weeklyEcoTips: 'lastEcoTipSent',
    educationalContent: 'lastEducationalContentSent',
    localEvents: 'lastLocalEventSent'
  };
  
  if (timestampFields[emailType]) {
    this[timestampFields[emailType]] = new Date();
    await this.save();
  }
};

const EmailPreference = mongoose.model('EmailPreference', EmailPreferenceSchema);

module.exports = EmailPreference; 