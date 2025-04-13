const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
  challenges: [{
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge'
    },
    progress: {
      type: Number,
      default: 0
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
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
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Initialize achievements array if it doesn't exist
userSchema.pre('save', function(next) {
  if (!this.achievements) {
    this.achievements = [];
  }
  next();
});

// Add a method to check and update achievements when points change
userSchema.pre('save', async function(next) {
  if (this.isModified('points')) {
    try {
      console.log('Points modified, checking achievements. Current points:', this.points);
      const Achievement = mongoose.model('Achievement');
      const achievements = await Achievement.find();
      
      for (const achievement of achievements) {
        if (!this.achievements.includes(achievement._id)) {
          const meetsCriteria = await achievement.checkCriteria(this);
          if (meetsCriteria) {
            console.log('Achievement criteria met:', achievement.title);
            this.achievements.push(achievement._id);
          }
        }
      }
    } catch (error) {
      console.error('Error checking achievements in pre-save:', error);
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema); 