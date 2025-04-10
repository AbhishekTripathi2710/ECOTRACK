const mongoose = require('mongoose');

const carbonEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['transportation', 'energy', 'waste', 'food', 'other']
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    source: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: false
    },
    notes: {
        type: String,
        required: false
    }
}, {
    timestamps: true
});

// Index for efficient querying
carbonEntrySchema.index({ userId: 1, date: -1 });

const CarbonEntry = mongoose.model('CarbonEntry', carbonEntrySchema);

module.exports = CarbonEntry; 