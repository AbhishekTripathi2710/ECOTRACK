const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const {
    register,
    requestOTP,
    verifyOTP,
    getProfile,
    updateProfile,
    logoutUser
} = require('../controllers/userController');

// Public routes
router.post('/register', register);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);

// Protected routes
router.use(protect);
router.get('/me', getProfile);
router.put('/profile', updateProfile);
router.post('/logout', logoutUser);

module.exports = router; 