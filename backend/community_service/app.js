const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// Import routes
const leaderboardRoutes = require('./routes/leaderboard');
const challengesRoutes = require('./routes/challenges');
const achievementsRoutes = require('./routes/achievements');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/achievements', achievementsRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Community Service API is running' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Community Service running on port ${PORT}`);
});

module.exports = app; 