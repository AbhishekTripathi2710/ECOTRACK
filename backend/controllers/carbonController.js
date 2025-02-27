const CarbonData = require("../models/carbonDataModel");

// ✅ Function to calculate carbon footprint based on user input
const calculateCarbonFootprint = (data) => {
    let footprint = 0;

    // ✅ Transportation footprint (kg CO₂ per km)
    footprint += (data.transportation?.car || 0) * 0.12;  // Car
    footprint += (data.transportation?.bike || 0) * 0.08;  // Bike
    footprint += (data.transportation?.publicTransport || 0) * 0.1;  // Bus/Train
    footprint += (data.transportation?.flights || 0) * 0.24;  // Flights (per km)

    // ✅ Electricity Bill Conversion (₹ to kWh, then to CO₂)
    const electricityKwh = (data.energy?.electricityBill || 0) / 8;  // Convert ₹ to kWh
    footprint += electricityKwh * 0.8;  // 0.8 kg CO₂ per kWh

    // ✅ Gas Usage Calculation
    if (data.energy?.gasType === "PNG") {
        const gasKg = (data.energy.gasBill || 0) / 40;  // ₹40 per kg (approx.)
        footprint += gasKg * 2.0;  // PNG: 2.0 kg CO₂ per kg
    } else if (data.energy?.gasType === "LPG") {
        const lpgKg = (data.energy.lpgCylinders || 0) * 14.2;  // 1 cylinder = 14.2 kg
        footprint += lpgKg * 2.98;  // LPG: 2.98 kg CO₂ per kg
    }

    // ✅ Food Consumption (Calories to kg CO₂)
    if (data.food?.calories) {
        let emissionFactor = 0;
        if (data.food?.diet === "vegan") {
            emissionFactor = 1.5 / 2000;  // Vegan: 1.5 kg CO₂ per 2000 kcal
        } else if (data.food?.diet === "vegetarian") {
            emissionFactor = 2.0 / 2000;  // Vegetarian: 2.0 kg CO₂ per 2000 kcal
        } else if (data.food?.diet === "non-vegetarian") {
            emissionFactor = 5.0 / 2000;  // Non-Veg: 5.0 kg CO₂ per 2000 kcal
        }
        footprint += data.food.calories * emissionFactor;
    }

    // ✅ Renewable Energy Discount
    if (data.energy?.renewableUsage) {
        footprint *= 0.8;  // 20% reduction if renewable energy is used
    }

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
