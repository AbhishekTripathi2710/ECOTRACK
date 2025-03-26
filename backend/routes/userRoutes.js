const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    register,
    login,
    getProfile,
    updateProfile
} = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(protect);
router.get('/me', getProfile);
router.put('/profile', updateProfile);

module.exports = router; 