const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true,
    default: 0
  },
  criteria: {
    type: {
      type: String,
      enum: ['points', 'challenges', 'carbon_reduction', 'duration', 'helping_others'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    threshold: {
      type: Number
    }
  },
  icon: {
    type: String,
    default: 'default-achievement-icon'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
achievementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if a user has met the achievement criteria
achievementSchema.methods.checkCriteria = function(user) {
  switch (this.criteria.type) {
    case 'points':
      return user.points >= this.criteria.value;
      
    case 'challenges':
      return user.challenges?.length >= this.criteria.value;
      
    case 'carbon_reduction':
      // Check if user has carbon reduction data
      if (!user.carbonData || !user.carbonData.history || user.carbonData.history.length < 2) {
        return false;
      }
      
      // Sort history by date
      const sortedHistory = [...user.carbonData.history].sort((a, b) => 
        new Date(a.date) - new Date(b.date));
      
      // Calculate the total reduction percentage
      const firstReading = sortedHistory[0].carbonFootprint;
      const lastReading = sortedHistory[sortedHistory.length - 1].carbonFootprint;
      
      if (firstReading <= 0) return false; // Avoid division by zero
      
      const reductionPercentage = ((firstReading - lastReading) / firstReading) * 100;
      return reductionPercentage >= this.criteria.value;
      
    case 'duration':
      // Check if user has maintained low carbon footprint for specified duration
      if (!user.carbonData || !user.carbonData.history) {
        return false;
      }
      
      const NOW = new Date();
      const durationMonths = this.criteria.value;
      const thresholdDate = new Date();
      thresholdDate.setMonth(thresholdDate.getMonth() - durationMonths);
      
      // Get readings since the threshold date
      const relevantReadings = user.carbonData.history.filter(entry => 
        new Date(entry.date) >= thresholdDate);
      
      // If we don't have enough readings, return false
      if (relevantReadings.length < durationMonths) {
        return false;
      }
      
      // Check if all readings are below the threshold (if specified)
      const threshold = this.criteria.threshold || 1000; // Default threshold
      return relevantReadings.every(entry => entry.carbonFootprint <= threshold);
      
    case 'helping_others':
      // Check if user has helped others reduce their footprint
      if (!user.communityStats || !user.communityStats.usersHelped) {
        return false;
      }
      
      return user.communityStats.usersHelped >= this.criteria.value;
      
    default:
      return false;
  }
};

module.exports = mongoose.model('Achievement', achievementSchema); 