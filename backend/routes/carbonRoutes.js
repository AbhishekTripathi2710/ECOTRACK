const express = require("express");
const { submitCarbonData, getUserHistory } = require("../controllers/carbonController");
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router();

router.post("/submit",authMiddleware,submitCarbonData);
router.get("/history",authMiddleware,getUserHistory);

module.exports = router;