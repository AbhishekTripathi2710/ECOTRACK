const mongoose = require('mongoose');

const carbonFootprintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    transportation: {
        car: {
            distance: Number,
            fuelType: String,
            efficiency: Number
        },
        publicTransport: {
            bus: Number,
            train: Number,
            subway: Number
        },
        flights: [{
            distance: Number,
            class: String
        }]
    },
    energy: {
        electricity: {
            consumption: Number,
            source: String
        },
        gas: {
            consumption: Number,
            type: String
        },
        water: {
            consumption: Number
        }
    },
    food: {
        dietType: String,
        meatConsumption: Number,
        dairyConsumption: Number,
        foodWaste: Number
    },
    shopping: {
        clothing: Number,
        electronics: Number,
        other: Number
    },
    waste: {
        recycling: Number,
        composting: Number,
        landfill: Number
    },
    totalEmissions: {
        type: Number,
        default: 0
    },
    goals: {
        target: Number,
        deadline: Date
    },
    achievements: [{
        type: String,
        date: Date
    }]
});

// Calculate total emissions
carbonFootprintSchema.methods.calculateTotalEmissions = function() {
    let total = 0;
    
    // Transportation emissions
    if (this.transportation.car) {
        const carEmissions = this.transportation.car.distance * 
            (this.transportation.car.fuelType === 'petrol' ? 2.3 : 2.7) / 
            this.transportation.car.efficiency;
        total += carEmissions;
    }
    
    // Public transport emissions
    if (this.transportation.publicTransport) {
        const pt = this.transportation.publicTransport;
        total += (pt.bus * 0.1) + (pt.train * 0.05) + (pt.subway * 0.05);
    }
    
    // Flight emissions
    if (this.transportation.flights) {
        this.transportation.flights.forEach(flight => {
            const multiplier = flight.class === 'economy' ? 0.1 : 0.2;
            total += flight.distance * multiplier;
        });
    }
    
    // Energy emissions
    if (this.energy.electricity) {
        const electricityEmissions = this.energy.electricity.consumption * 
            (this.energy.electricity.source === 'renewable' ? 0.1 : 0.5);
        total += electricityEmissions;
    }
    
    if (this.energy.gas) {
        const gasEmissions = this.energy.gas.consumption * 
            (this.energy.gas.type === 'natural' ? 2.1 : 2.7);
        total += gasEmissions;
    }
    
    // Food emissions
    if (this.food) {
        const dietMultiplier = {
            'vegan': 0.5,
            'vegetarian': 0.7,
            'omnivore': 1
        }[this.food.dietType] || 1;
        
        total += (this.food.meatConsumption * 2.5 + 
                 this.food.dairyConsumption * 1.5) * dietMultiplier;
    }
    
    // Shopping emissions
    if (this.shopping) {
        total += this.shopping.clothing * 0.3 +
                 this.shopping.electronics * 0.5 +
                 this.shopping.other * 0.2;
    }
    
    // Waste emissions
    if (this.waste) {
        total += this.waste.landfill * 0.5;
        total -= (this.waste.recycling * 0.3 + this.waste.composting * 0.2);
    }
    
    this.totalEmissions = total;
    return total;
};

// Get historical data
carbonFootprintSchema.statics.getHistoricalData = async function(userId, period) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);
    
    return await this.find({
        userId,
        date: { $gte: startDate }
    }).sort({ date: 1 });
};

// Get recommendations
carbonFootprintSchema.methods.getRecommendations = function() {
    const recommendations = [];
    
    if (this.transportation.car && this.transportation.car.distance > 50) {
        recommendations.push({
            category: 'transportation',
            message: 'Consider carpooling or using public transport for long distances',
            potentialReduction: '20-30%'
        });
    }
    
    if (this.energy.electricity && this.energy.electricity.consumption > 1000) {
        recommendations.push({
            category: 'energy',
            message: 'Switch to LED bulbs and unplug unused electronics',
            potentialReduction: '15-25%'
        });
    }
    
    if (this.food && this.food.foodWaste > 5) {
        recommendations.push({
            category: 'food',
            message: 'Plan meals and store food properly to reduce waste',
            potentialReduction: '10-20%'
        });
    }
    
    return recommendations;
};

const CarbonFootprint = mongoose.model('CarbonFootprint', carbonFootprintSchema);

module.exports = CarbonFootprint; 