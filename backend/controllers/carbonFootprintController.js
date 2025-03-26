const CarbonFootprint = require('../models/carbonFootprintModel');
const User = require('../models/userModel');

// Create new carbon footprint entry
exports.createFootprint = async (req, res) => {
    try {
        const footprint = new CarbonFootprint({
            ...req.body,
            userId: req.user._id
        });
        
        await footprint.save();
        footprint.calculateTotalEmissions();
        await footprint.save();
        
        res.status(201).json({
            success: true,
            data: footprint
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get user's carbon footprint history
exports.getFootprintHistory = async (req, res) => {
    try {
        const period = parseInt(req.query.period) || 30; // Default to 30 days
        const footprints = await CarbonFootprint.getHistoricalData(req.user._id, period);
        
        res.status(200).json({
            success: true,
            data: footprints
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get current carbon footprint
exports.getCurrentFootprint = async (req, res) => {
    try {
        const footprint = await CarbonFootprint.findOne({
            userId: req.user._id
        }).sort({ date: -1 });
        
        if (!footprint) {
            return res.status(404).json({
                success: false,
                error: 'No carbon footprint data found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: footprint
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update carbon footprint
exports.updateFootprint = async (req, res) => {
    try {
        const footprint = await CarbonFootprint.findOne({
            userId: req.user._id,
            _id: req.params.id
        });
        
        if (!footprint) {
            return res.status(404).json({
                success: false,
                error: 'Carbon footprint not found'
            });
        }
        
        Object.assign(footprint, req.body);
        footprint.calculateTotalEmissions();
        await footprint.save();
        
        res.status(200).json({
            success: true,
            data: footprint
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get recommendations
exports.getRecommendations = async (req, res) => {
    try {
        const footprint = await CarbonFootprint.findOne({
            userId: req.user._id
        }).sort({ date: -1 });
        
        if (!footprint) {
            return res.status(404).json({
                success: false,
                error: 'No carbon footprint data found'
            });
        }
        
        const recommendations = footprint.getRecommendations();
        
        res.status(200).json({
            success: true,
            data: recommendations
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Set carbon reduction goal
exports.setGoal = async (req, res) => {
    try {
        const footprint = await CarbonFootprint.findOne({
            userId: req.user._id
        }).sort({ date: -1 });
        
        if (!footprint) {
            return res.status(404).json({
                success: false,
                error: 'No carbon footprint data found'
            });
        }
        
        footprint.goals = {
            target: req.body.target,
            deadline: req.body.deadline
        };
        
        await footprint.save();
        
        res.status(200).json({
            success: true,
            data: footprint.goals
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get community leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await CarbonFootprint.aggregate([
            {
                $group: {
                    _id: '$userId',
                    totalEmissions: { $sum: '$totalEmissions' }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    name: { $concat: ['$user.fullname.firstname', ' ', '$user.fullname.lastname'] },
                    totalEmissions: 1
                }
            },
            {
                $sort: { totalEmissions: 1 }
            },
            {
                $limit: 10
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: leaderboard
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
}; 