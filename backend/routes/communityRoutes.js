const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const challengeController = require('../controllers/challengeController');
const achievementController = require('../controllers/achievementController');
const auth = require('../middleware/auth');

router.get('/leaderboard/top', leaderboardController.getTopUsers);
router.get('/leaderboard/user/:userId', leaderboardController.getUserRank);
router.post('/leaderboard/update-points', auth, leaderboardController.updateUserPoints);

router.get('/challenges', challengeController.getAllChallenges);
router.post('/challenges', auth, challengeController.createChallenge);
router.post('/challenges/:challengeId/join', auth, challengeController.joinChallenge);
router.put('/challenges/:challengeId/progress', auth, challengeController.updateChallengeProgress);

router.get('/achievements', achievementController.getAllAchievements);
router.get('/achievements/user/:userId', achievementController.getUserAchievements);
router.post('/achievements/check', achievementController.checkAchievements);
router.post('/achievements', auth, achievementController.createAchievement);

module.exports = router; 