require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Emission = require('../models/Emission');
const emailService = require('../services/emailService');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

function getTips(emissions) {
    const tips = [
        "Consider using public transportation or carpooling to reduce your travel emissions.",
        "Switch to energy-efficient LED light bulbs to save electricity.",
        "Try to reduce meat consumption and incorporate more plant-based meals.",
        "Use reusable water bottles and coffee cups to reduce waste.",
        "Turn off electronics when not in use to save energy.",
        "Consider installing solar panels if possible.",
        "Use cold water for laundry to save energy.",
        "Plant trees or support reforestation projects.",
        "Use a programmable thermostat to optimize heating and cooling.",
        "Consider buying local produce to reduce transportation emissions."
    ];

    return tips.sort(() => 0.5 - Math.random()).slice(0, 3);
}

function calculateLevelProgress(user) {
    const currentLevel = Math.floor(user.points / 100) + 1;
    const nextLevel = currentLevel + 1;
    const progress = ((user.points % 100) / 100) * 100;
    
    return {
        currentLevel,
        nextLevel,
        progress: Math.round(progress)
    };
}

async function getRecentAchievements(userId) {
    return [
        {
            name: "First Steps",
            description: "Completed your first carbon footprint calculation"
        },
        {
            name: "Consistent Tracker",
            description: "Logged emissions for 5 consecutive days"
        }
    ];
}

async function sendWeeklyReports() {
    try {
        
        const users = await User.find({ email: { $exists: true } });
        console.log(`Found ${users.length} users to send reports to`);

        for (const user of users) {
            try {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

                const emissions = await Emission.find({
                    userId: user._id,
                    date: { $gte: oneWeekAgo }
                });

                const totalEmissions = emissions.reduce((sum, emission) => sum + emission.amount, 0);

                const levelProgress = calculateLevelProgress(user);

                const achievements = await getRecentAchievements(user._id);

                const tips = getTips(emissions);

                const emailData = {
                    name: user.name,
                    totalEmissions: totalEmissions.toFixed(2),
                    entryCount: emissions.length,
                    currentLevel: levelProgress.currentLevel,
                    nextLevel: levelProgress.nextLevel,
                    progress: levelProgress.progress,
                    achievements,
                    tips
                };

                await emailService.sendWeeklyReport(user.email, emailData);
                console.log(`Sent weekly report to ${user.email}`);

                await new Promise(resolve => setTimeout(resolve, 1000));
            } catch (error) {
                console.error(`Error sending report to ${user.email}:`, error);
                continue; 
            }
        }

        console.log('Finished sending weekly reports');
    } catch (error) {
        console.error('Error in sendWeeklyReports:', error);
    } finally {
        // Close MongoDB connection
        await mongoose.connection.close();
        console.log('Closed MongoDB connection');
    }
}

sendWeeklyReports(); 