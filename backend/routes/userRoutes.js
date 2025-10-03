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


router.post('/register', register);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);


router.use(protect);
router.get('/me', getProfile);
router.put('/profile', updateProfile);
router.post('/logout', logoutUser);

module.exports = router; 