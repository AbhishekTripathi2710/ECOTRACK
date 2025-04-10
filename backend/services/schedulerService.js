const cron = require('node-cron');
const User = require('../models/User');
const ReportService = require('./reportService');
const emailService = require('./emailService');

class SchedulerService {
    static init() {
        // Schedule weekly reports to be sent every Monday at 9:00 AM
        cron.schedule('0 9 * * 1', async () => {
            try {
                console.log('Starting weekly report generation...');
                
                // Get all users (we'll filter out inactive ones later if needed)
                const users = await User.find({});
                console.log(`Found ${users.length} users`);

                // Generate and send reports for each user
                for (const user of users) {
                    try {
                        if (!user.email) {
                            console.log(`Skipping user ${user._id} - no email address`);
                            continue;
                        }

                        // Generate report data
                        await ReportService.generateWeeklyReport(user._id);
                        console.log(`Successfully sent report to ${user.email}`);
                    } catch (error) {
                        console.error(`Failed to process report for user ${user.email}:`, error);
                        // Continue with next user even if one fails
                        continue;
                    }
                }

                console.log('Weekly report generation completed');
            } catch (error) {
                console.error('Error in weekly report scheduler:', error);
            }
        });

        console.log('Scheduler service initialized');
    }
}

module.exports = SchedulerService; 