const express = require("express");
const { submitCarbonData, getUserHistory, getLatestCarbonData, getMonthlyCarbonData } = require("../controllers/carbonController");
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router();

// All routes require authentication
router.use(authMiddleware.authUser);

// Submit new carbon data
router.post("/submit", submitCarbonData);

// Get user's latest carbon data
router.get("/user-data", getLatestCarbonData);

// Get user's monthly carbon data
router.get("/monthly", getMonthlyCarbonData);

// Get user's carbon footprint history
router.get("/history", getUserHistory);

module.exports = router;