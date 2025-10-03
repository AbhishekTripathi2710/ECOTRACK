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

router.use(protect);

router.post('/', createFootprint);

router.get('/history', getFootprintHistory);

router.get('/current', getCurrentFootprint);

router.put('/:id', updateFootprint);

router.get('/recommendations', getRecommendations);

router.post('/goals', setGoal);

router.get('/leaderboard', getLeaderboard);

module.exports = router; 