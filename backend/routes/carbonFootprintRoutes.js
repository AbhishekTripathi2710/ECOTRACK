const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    createFootprint,
    getFootprintHistory,
    getCurrentFootprint,
    updateFootprint,
    getRecommendations,
    setGoal,
    getLeaderboard
} = require('../controllers/carbonFootprintController');

// All routes are protected and require authentication
router.use(protect);

// Create new carbon footprint entry
router.post('/', createFootprint);

// Get user's carbon footprint history
router.get('/history', getFootprintHistory);

// Get current carbon footprint
router.get('/current', getCurrentFootprint);

// Update carbon footprint
router.put('/:id', updateFootprint);

// Get personalized recommendations
router.get('/recommendations', getRecommendations);

// Set carbon reduction goal
router.post('/goals', setGoal);

// Get community leaderboard
router.get('/leaderboard', getLeaderboard);

module.exports = router; 