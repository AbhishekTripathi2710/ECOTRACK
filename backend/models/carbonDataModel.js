const mongoose = require("mongoose");

const carbonDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
    transportation: {
        car: { type: Number, default: 0 }, // Liters of petrol
        bike: { type: Number, default: 0 }, // Liters of petrol
        publicTransport: { type: Number, default: 0 }, // km traveled
        flights: { type: Number, default: 0 } // No. of flights
    },
    energy: {
        electricityBill: { type: Number, default: 0 }, // Monthly electricity bill (₹)
        gasBill: { type: Number, default: 0 }, // Monthly PNG gas bill (₹)
        lpgCylinders: { type: Number, default: 0 }, // No. of LPG cylinders used
        gasType: { type: String, enum: ["PNG", "LPG"], required: true },
        renewableUsage: { type: Boolean, default: false }
    },
    diet: { type: String, enum: ["vegan", "vegetarian", "non-vegetarian"], required: true },
    totalFootprint: { type: Number, default: 0 },
    date: { type: Date, default: Date.now }
});


const CarbonData = mongoose.model("carbonData", carbonDataSchema);
module.exports = CarbonData;