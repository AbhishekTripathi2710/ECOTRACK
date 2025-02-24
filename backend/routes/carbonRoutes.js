const express = require("express");
const { submitCarbonData, getUserHistory } = require("../controllers/carbonController");
const authMiddleware = require('../middlewares/authMiddleware')

const router = express.Router();

router.post("/submit", authMiddleware.authUser, submitCarbonData);
router.get("/history", authMiddleware.authUser, getUserHistory);


module.exports = router;