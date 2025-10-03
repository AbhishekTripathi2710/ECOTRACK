const express = require("express");
const { submitCarbonData, getUserHistory, getLatestCarbonData, getMonthlyCarbonData } = require("../controllers/carbonController");
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router();

router.use(authMiddleware.authUser);

router.post("/submit", submitCarbonData);

router.get("/user-data", getLatestCarbonData);

router.get("/monthly", getMonthlyCarbonData);

router.get("/history", getUserHistory);

module.exports = router;