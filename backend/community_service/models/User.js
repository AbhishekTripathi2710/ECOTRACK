const mongoose = require('mongoose');

// Define the User schema to match the main backend's schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: String,
  role: {
    type: String,
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create the model
const User = mongoose.model('User', userSchema);

module.exports = User; 