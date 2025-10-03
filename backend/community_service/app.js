const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;


const leaderboardRoutes = require('./routes/leaderboard');
const challengesRoutes = require('./routes/challenges');
const achievementsRoutes = require('./routes/achievements');


app.use(cors());
app.use(express.json());


app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/achievements', achievementsRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Community Service API is running' });
});

app.listen(PORT, () => {
  console.log(`Community Service running on port ${PORT}`);
});

module.exports = app; 