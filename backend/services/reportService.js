const User = require('../models/User');
const CarbonEntry = require('../models/CarbonEntry');
const Achievement = require('../models/Achievement');
const emailService = require('./emailService');

class ReportService {
    static async generateWeeklyReport(userId) {
        try {
            // Get user data
            const user = await User.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Get date range for last week
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);

            // Get carbon entries for the week
            const entries = await CarbonEntry.find({
                userId,
                date: {
                    $gte: startDate,
                    $lte: endDate
                }
            });

            // Calculate total emissions for the week
            const totalEmissions = entries.reduce((sum, entry) => sum + entry.emissions, 0);

            // Get user's achievements
            const achievements = await Achievement.find({ userId });

            // Calculate progress towards next level
            const currentLevel = user.level || 1;
            const nextLevel = currentLevel + 1;
            const pointsNeeded = nextLevel * 100; // Example: 100 points per level
            const progress = ((user.points || 0) / pointsNeeded) * 100;

            // Generate tips based on user's data
            const tips = this.generateTips(entries);

            // Send the report email
            await emailService.sendWeeklyReport({
                email: user.email,
                name: user.fullname.firstname,
                data: {
                    totalEmissions,
                    entriesCount: entries.length,
                    achievements: achievements.length,
                    currentLevel,
                    nextLevel,
                    progress,
                    tips
                }
            });

            return true;
        } catch (error) {
            console.error('Error generating weekly report:', error);
            throw error;
        }
    }

    static generateTips(entries) {
        const tips = [];

        // Analyze transportation entries
        const transportEntries = entries.filter(e => e.category === 'transportation');
        if (transportEntries.length > 0) {
            tips.push('Consider using public transportation or carpooling to reduce your carbon footprint.');
        }

        // Analyze energy entries
        const energyEntries = entries.filter(e => e.category === 'energy');
        if (energyEntries.length > 0) {
            tips.push('Switch to energy-efficient appliances and remember to turn off lights when not in use.');
        }

        // Analyze waste entries
        const wasteEntries = entries.filter(e => e.category === 'waste');
        if (wasteEntries.length > 0) {
            tips.push('Practice recycling and composting to reduce waste sent to landfills.');
        }

        // Add general tips if not enough specific tips
        if (tips.length < 3) {
            tips.push('Consider using reusable water bottles and coffee cups.');
            tips.push('Try to reduce meat consumption and eat more plant-based meals.');
            tips.push('Support local and seasonal produce to reduce transportation emissions.');
        }

        return tips.slice(0, 3); // Return top 3 tips
    }
}

module.exports = ReportService; 