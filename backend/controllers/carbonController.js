const CarbonData = require("../models/carbonDataModel");

// ✅ Function to calculate carbon footprint based on user input
const calculateCarbonFootprint = (data) => {
    let footprint = 0;

    // ✅ Transportation footprint
    footprint += (data.transportation?.car || 0) * 2.3;
    footprint += (data.transportation?.bike || 0) * 2.3;
    footprint += (data.transportation?.publicTransport || 0) * 0.1;
    footprint += (data.transportation?.flights || 0) * 250;

    // ✅ Electricity Bill Conversion
    const electricityKwh = (data.energy?.electricityBill || 0) / 8;
    footprint += electricityKwh * 0.82;

    // ✅ Gas Usage Calculation
    if (data.energy?.gasType === "PNG") {
        const gasCubicMeters = (data.energy.gasBill || 0) / 50;
        footprint += gasCubicMeters * 1.92;
    } else if (data.energy?.gasType === "LPG") {
        const lpgKg = (data.energy.lpgCylinders || 0) * 14.2;
        footprint += lpgKg * 2.98;
    }

    // ✅ Renewable Energy Discount
    if (data.energy?.renewableUsage) {
        footprint *= 0.8;
    }

    // ✅ Diet Factor Calculation
    const dietFactors = { vegan: 100, vegetarian: 150, "non-vegetarian": 270 };
    footprint += dietFactors[data.diet] || 0;

    return footprint.toFixed(2);
};

// ✅ Function to submit daily carbon data and update monthly total
exports.submitCarbonData = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user._id;
        const footprint = parseFloat(calculateCarbonFootprint(req.body));
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // ✅ Get the latest entry for this month
        const latestEntry = await CarbonData.findOne({
            userId,
            date: {
                $gte: new Date(currentYear, currentMonth, 1),
                $lt: new Date(currentYear, currentMonth + 1, 1),
            },
        }).sort({ date: -1 });

        let monthlyFootprint = footprint;
        if (latestEntry) {
            monthlyFootprint += latestEntry.monthlyFootprint;
        }

        // ✅ Save the new entry
        const carbonEntry = new CarbonData({
            userId,
            ...req.body,
            totalFootprint: footprint,
            monthlyFootprint,
            date: today,
        });

        await carbonEntry.save();

        res.status(201).json({ message: "Data submitted successfully", dailyFootprint: footprint, monthlyFootprint });
    } catch (error) {
        console.error("🚨 Error in submitCarbonData:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get the user's carbon footprint history
exports.getUserHistory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user._id;
        const history = await CarbonData.find({ userId }).sort({ date: -1 });

        res.status(200).json({ history });
    } catch (error) {
        console.error("🚨 Error in getUserHistory:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get the latest carbon footprint data for the user
exports.getLatestCarbonData = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user._id;
        const latestEntry = await CarbonData.findOne({ userId }).sort({ date: -1 });

        if (!latestEntry) {
            return res.status(404).json({ message: "No carbon data found for this user" });
        }

        res.status(200).json(latestEntry);
    } catch (error) {
        console.error("🚨 Error in getLatestCarbonData:", error);
        res.status(500).json({ error: error.message });
    }
};

// ✅ Get Monthly Carbon Footprint
exports.getMonthlyCarbonData = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user._id;
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        // ✅ Fetch the latest entry from this month
        const latestEntry = await CarbonData.findOne({
            userId,
            date: {
                $gte: new Date(currentYear, currentMonth, 1),
                $lt: new Date(currentYear, currentMonth + 1, 1),
            },
        }).sort({ date: -1 });

        if (!latestEntry) {
            return res.status(200).json({ monthlyFootprint: 0, message: "No data available for this month" });
        }

        res.status(200).json({ monthlyFootprint: latestEntry.monthlyFootprint });
    } catch (error) {
        console.error("🚨 Error in getMonthlyCarbonData:", error);
        res.status(500).json({ error: error.message });
    }
};
