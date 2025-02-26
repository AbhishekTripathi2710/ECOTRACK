const express = require("express");
const { submitCarbonData, getUserHistory, getLatestCarbonData, getMonthlyCarbonData } = require("../controllers/carbonController");
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router();

router.post("/submit", authMiddleware.authUser, submitCarbonData);
router.get("/history", authMiddleware.authUser, getUserHistory);
router.get("/user-data", authMiddleware.authUser, getLatestCarbonData);
router.get("/monthly",authMiddleware.authUser,getMonthlyCarbonData)

module.exports = router;