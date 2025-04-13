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
achievementSchema.methods.checkCriteria = async function(user) {
  console.log(`Checking criteria for achievement: ${this.title}`);
  console.log('Criteria type:', this.criteria.type);
  console.log('Criteria value:', this.criteria.value);
  console.log('User points:', user.points);

  switch (this.criteria.type) {
    case 'points':
      const pointsMet = user.points >= this.criteria.value;
      console.log(`Points criteria met: ${pointsMet} (${user.points} >= ${this.criteria.value})`);
      return pointsMet;
      
    case 'challenges':
      return user.challenges?.length >= this.criteria.value;
      
    case 'carbon_reduction':
      // Get carbon entries for the user
      const carbonEntries = await mongoose.model('CarbonEntry').find({ userId: user._id })
        .sort({ date: 1 });
      
      if (!carbonEntries || carbonEntries.length < 2) {
        return false;
      }
      
      // Calculate total carbon footprint for each date
      const carbonByDate = {};
      carbonEntries.forEach(entry => {
        const date = entry.date.toISOString().split('T')[0];
        if (!carbonByDate[date]) {
          carbonByDate[date] = 0;
        }
        carbonByDate[date] += entry.amount;
      });
      
      // Convert to array and sort by date
      const sortedHistory = Object.entries(carbonByDate)
        .map(([date, carbonFootprint]) => ({ date, carbonFootprint }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Calculate the total reduction percentage
      const firstReading = sortedHistory[0].carbonFootprint;
      const lastReading = sortedHistory[sortedHistory.length - 1].carbonFootprint;
      
      if (firstReading <= 0) return false; // Avoid division by zero
      
      const reductionPercentage = ((firstReading - lastReading) / firstReading) * 100;
      return reductionPercentage >= this.criteria.value;
      
    case 'duration':
      // Get carbon entries for the user
      const userCarbonEntries = await mongoose.model('CarbonEntry').find({ userId: user._id })
        .sort({ date: 1 });
      
      if (!userCarbonEntries || userCarbonEntries.length === 0) {
        return false;
      }
      
      const NOW = new Date();
      const durationMonths = this.criteria.value;
      const thresholdDate = new Date();
      thresholdDate.setMonth(thresholdDate.getMonth() - durationMonths);
      
      // Calculate daily carbon footprint
      const dailyCarbon = {};
      userCarbonEntries.forEach(entry => {
        const date = entry.date.toISOString().split('T')[0];
        if (!dailyCarbon[date]) {
          dailyCarbon[date] = 0;
        }
        dailyCarbon[date] += entry.amount;
      });
      
      // Convert to array and sort by date
      const sortedDailyCarbon = Object.entries(dailyCarbon)
        .map(([date, carbonFootprint]) => ({ date, carbonFootprint }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Get readings since the threshold date
      const relevantReadings = sortedDailyCarbon.filter(entry => 
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