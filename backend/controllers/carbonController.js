const CarbonData = require("../models/carbonDataModel");

const calculateCarbonFootprint = (data) => {
    let footprint = 0;

    // ✅ Fix typo: "transportaion" → "transportation"
    footprint += (data.transportation?.car || 0) * 2.3; // Car petrol
    footprint += (data.transportation?.bike || 0) * 2.3; // Bike petrol
    footprint += (data.transportation?.publicTransport || 0) * 0.1; // Bus/Metro
    footprint += (data.transportation?.flights || 0) * 250; // Flights

    // ✅ Electricity Bill Conversion to CO₂
    const electricityKwh = (data.energy?.electricityBill || 0) / 8; // ₹8 per kWh
    footprint += electricityKwh * 0.82;

    // ✅ Gas Usage Calculation
    if (data.energy?.gasType === "PNG") {
        const gasCubicMeters = (data.energy.gasBill || 0) / 50; // ₹50 per cubic meter
        footprint += gasCubicMeters * 1.92;
    } else if (data.energy?.gasType === "LPG") {
        const lpgKg = (data.energy.lpgCylinders || 0) * 14.2; // 1 cylinder = 14.2 kg
        footprint += lpgKg * 2.98;
    }

    // ✅ Renewable Energy Discount
    if (data.energy?.renewableUsage) {
        footprint *= 0.8;
    }

    // ✅ Diet Factor Calculation
    const dietFactors = { vegan: 100, vegetarian: 150, "non-vegetarian": 270 };
    footprint += dietFactors[data.diet] || 0;

    // ✅ Shopping & Recycling Contribution
    footprint += ((data.shopping?.clothing || 0) / 5000) * 50; // 50 kg CO₂ per ₹5000 spent on clothing
    footprint += ((data.shopping?.electronics || 0) / 10000) * 100; // 100 kg CO₂ per ₹10000 spent on electronics

    if (data.shopping?.recycling) {
        footprint *= 0.9; // Recycling reduces footprint by 10%
    }

    return footprint.toFixed(2);
};

exports.submitCarbonData = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // ✅ Validate user input
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        const userId = req.user._id;
        const footprint = calculateCarbonFootprint(req.body);

        const carbonEntry = new CarbonData({
            userId,
            ...req.body,
            totalFootprint: footprint,
            date: new Date(), // ✅ Add timestamp for sorting
        });

        await carbonEntry.save();

        res.status(201).json({ message: "Data submitted successfully", footprint });
    } catch (error) {
        console.error("🚨 Error in submitCarbonData:", error); // Log full error
        res.status(500).json({ error: error.message });
    }
};


exports.getUserHistory = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user._id;
        const history = await CarbonData.find({ userId }).sort({ date: -1 }); // ✅ Fix sorting

        res.status(200).json({ history });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getLatestCarbonData = async(req,res)=>{
    try{
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const userId = req.user._id;

        // Fetch the latest carbon footprint entry
        const latestEntry = await CarbonData.findOne({ userId }).sort({ date: -1 });

        if (!latestEntry) {
            return res.status(404).json({ message: "No carbon data found for this user" });
        }

        // Format the response as required
        const formattedData = {
            transportation: {
                car: latestEntry.transportation.car,
                bike: latestEntry.transportation.bike,
                publicTransport: latestEntry.transportation.publicTransport,
                flights: latestEntry.transportation.flights
            },
            energy: {
                electricityBill: latestEntry.energy.electricityBill,
                gasBill: latestEntry.energy.gasBill,
                lpgCylinders: latestEntry.energy.lpgCylinders,
                gasType: latestEntry.energy.gasType,
                renewableUsage: latestEntry.energy.renewableUsage
            },
            diet: latestEntry.diet,
            shopping: {
                clothing: latestEntry.shopping.clothing,
                electronics: latestEntry.shopping.electronics,
                recycling: latestEntry.shopping.recycling
            },
            totalFootprint: latestEntry.totalFootprint,
            date: latestEntry.date
        };

        res.status(200).json(formattedData);
    }catch(error){
        console.error("🚨 Error in getLatestCarbonData:", error);
        res.status(500).json({ error: error.message });
    }
}