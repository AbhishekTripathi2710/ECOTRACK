const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
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
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
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
challengeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if challenge is active
challengeSchema.methods.isActive = function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startDate && now <= this.endDate;
};

module.exports = mongoose.model('Challenge', challengeSchema); 