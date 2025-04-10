const cron = require('node-cron');
const User = require('../models/User');
const EmailPreference = require('../models/EmailPreference');
const emailController = require('../controllers/emailController');
const CarbonFootprint = require('../controllers/carbonFootprintController');
const Challenge = require('../models/Challenge');

/**
 * Initialize all email schedulers
 */
const initializeSchedulers = () => {
  // Run weekly report emails - Every Sunday at 8 AM
  cron.schedule('0 8 * * 0', async () => {
    console.log('Running weekly carbon footprint report email job');
    await sendWeeklyReports();
  });
  
  // Run daily challenge reminders - Every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('Running challenge reminder email job');
    await sendChallengeReminders();
  });
  
  // Run weekly eco-tips - Every Wednesday at 10 AM
  cron.schedule('0 10 * * 3', async () => {
    console.log('Running weekly eco-tips email job');
    await sendWeeklyEcoTips();
  });
  
  // Run monthly educational content - 1st day of each month at 11 AM
  cron.schedule('0 11 1 * *', async () => {
    console.log('Running monthly educational content email job');
    await sendEducationalContent();
  });
  
  // Run bi-weekly local events - Every other Friday at 2 PM
  cron.schedule('0 14 */14 * 5', async () => {
    console.log('Running bi-weekly local events email job');
    await sendLocalEvents();
  });
  
  // Check for new challenges - Every Monday at 10 AM
  cron.schedule('0 10 * * 1', async () => {
    console.log('Running new challenge alerts email job');
    await sendNewChallengeAlerts();
  });
  
  // Daily job to check for milestones - Every day at 12 PM
  cron.schedule('0 12 * * *', async () => {
    console.log('Running milestone detection job');
    await detectAndSendMilestones();
  });
  
  // Send personalized suggestions - Every other Tuesday at 1 PM
  cron.schedule('0 13 */14 * 2', async () => {
    console.log('Running personalized suggestions email job');
    await sendPersonalizedSuggestions();
  });
  
  console.log('Email schedulers initialized');
};

/**
 * Send weekly carbon footprint reports to all eligible users
 */
const sendWeeklyReports = async () => {
  try {
    // Find users who have opted into weekly reports
    const preferences = await EmailPreference.find({ weeklyReport: true });
    
    let successCount = 0;
    let failureCount = 0;
    
    console.log(`Sending weekly reports to ${preferences.length} users`);
    
    // Send report to each user
    for (const preference of preferences) {
      try {
        const result = await emailController.sendWeeklyReport(preference.userId);
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          console.error(`Failed to send weekly report to user ${preference.userId}: ${result.error}`);
        }
      } catch (error) {
        failureCount++;
        console.error(`Exception sending weekly report to user ${preference.userId}:`, error);
      }
    }
    
    console.log(`Weekly reports sent: ${successCount} successful, ${failureCount} failed`);
  } catch (error) {
    console.error('Error in weekly reports job:', error);
  }
};

/**
 * Send challenge reminders to users with challenges ending soon
 */
const sendChallengeReminders = async () => {
  try {
    // Find users who have opted into challenge reminders
    const preferences = await EmailPreference.find({ challengeReminders: true });
    
    let successCount = 0;
    let failureCount = 0;
    
    console.log(`Checking challenge reminders for ${preferences.length} users`);
    
    // Send reminders to each user
    for (const preference of preferences) {
      try {
        const result = await emailController.sendChallengeReminder(preference.userId);
        if (result.success) {
          successCount++;
        } else {
          // Skip counting failures for "No challenges ending soon" errors
          if (result.error !== 'No challenges ending soon') {
            failureCount++;
            console.error(`Failed to send challenge reminder to user ${preference.userId}: ${result.error}`);
          }
        }
      } catch (error) {
        failureCount++;
        console.error(`Exception sending challenge reminder to user ${preference.userId}:`, error);
      }
    }
    
    console.log(`Challenge reminders sent: ${successCount} successful, ${failureCount} failed`);
  } catch (error) {
    console.error('Error in challenge reminders job:', error);
  }
};

/**
 * Send weekly eco-tips to all eligible users
 */
const sendWeeklyEcoTips = async () => {
  try {
    // Find users who have opted into weekly eco-tips
    const preferences = await EmailPreference.find({ weeklyEcoTips: true });
    
    let successCount = 0;
    let failureCount = 0;
    
    console.log(`Sending weekly eco-tips to ${preferences.length} users`);
    
    // Send eco-tips to each user
    for (const preference of preferences) {
      try {
        const result = await emailController.sendWeeklyEcoTips(preference.userId);
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          console.error(`Failed to send weekly eco-tips to user ${preference.userId}: ${result.error}`);
        }
      } catch (error) {
        failureCount++;
        console.error(`Exception sending weekly eco-tips to user ${preference.userId}:`, error);
      }
    }
    
    console.log(`Weekly eco-tips sent: ${successCount} successful, ${failureCount} failed`);
  } catch (error) {
    console.error('Error in weekly eco-tips job:', error);
  }
};

/**
 * Send educational content to all eligible users
 */
const sendEducationalContent = async () => {
  try {
    // Find users who have opted into educational content
    const preferences = await EmailPreference.find({ educationalContent: true });
    
    let successCount = 0;
    let failureCount = 0;
    
    console.log(`Sending educational content to ${preferences.length} users`);
    
    // Send educational content to each user
    for (const preference of preferences) {
      try {
        const result = await emailController.sendEducationalContent(preference.userId);
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          console.error(`Failed to send educational content to user ${preference.userId}: ${result.error}`);
        }
      } catch (error) {
        failureCount++;
        console.error(`Exception sending educational content to user ${preference.userId}:`, error);
      }
    }
    
    console.log(`Educational content sent: ${successCount} successful, ${failureCount} failed`);
  } catch (error) {
    console.error('Error in educational content job:', error);
  }
};

/**
 * Send local events information to all eligible users
 */
const sendLocalEvents = async () => {
  try {
    // Find users who have opted into local events notifications
    const preferences = await EmailPreference.find({ localEvents: true });
    
    let successCount = 0;
    let failureCount = 0;
    
    console.log(`Sending local events information to ${preferences.length} users`);
    
    // Send local events information to each user
    for (const preference of preferences) {
      try {
        const result = await emailController.sendLocalEvents(preference.userId);
        if (result.success) {
          successCount++;
        } else {
          failureCount++;
          console.error(`Failed to send local events information to user ${preference.userId}: ${result.error}`);
        }
      } catch (error) {
        failureCount++;
        console.error(`Exception sending local events information to user ${preference.userId}:`, error);
      }
    }
    
    console.log(`Local events information sent: ${successCount} successful, ${failureCount} failed`);
  } catch (error) {
    console.error('Error in local events job:', error);
  }
};

/**
 * Send new challenge alerts to all eligible users
 */
const sendNewChallengeAlerts = async () => {
  try {
    // Find users who have opted into new challenge alerts
    const preferences = await EmailPreference.find({ newChallengeAlerts: true });
    
    let successCount = 0;
    let failureCount = 0;
    
    console.log(`Checking new challenges for ${preferences.length} users`);
    
    // Send new challenge alerts to each user
    for (const preference of preferences) {
      try {
        const result = await emailController.sendNewChallengeAlert(preference.userId);
        if (result.success) {
          successCount++;
        } else {
          // Skip counting failures for "No new matching challenges found" errors
          if (result.error !== 'No new matching challenges found') {
            failureCount++;
            console.error(`Failed to send new challenge alert to user ${preference.userId}: ${result.error}`);
          }
        }
      } catch (error) {
        failureCount++;
        console.error(`Exception sending new challenge alert to user ${preference.userId}:`, error);
      }
    }
    
    console.log(`New challenge alerts sent: ${successCount} successful, ${failureCount} failed`);
  } catch (error) {
    console.error('Error in new challenge alerts job:', error);
  }
};

/**
 * Detect carbon footprint milestones and send alerts
 */
const detectAndSendMilestones = async () => {
  try {
    // Find users who have opted into milestone alerts
    const preferences = await EmailPreference.find({ milestoneAlerts: true });
    
    let successCount = 0;
    let failureCount = 0;
    let noMilestoneCount = 0;
    
    console.log(`Checking milestones for ${preferences.length} users`);
    
    // Check each user for milestones
    for (const preference of preferences) {
      try {
        const milestone = await detectMilestone(preference.userId);
        
        if (milestone) {
          const result = await emailController.sendMilestoneAlert(preference.userId, milestone);
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
            console.error(`Failed to send milestone alert to user ${preference.userId}: ${result.error}`);
          }
        } else {
          noMilestoneCount++;
        }
      } catch (error) {
        failureCount++;
        console.error(`Exception detecting/sending milestone for user ${preference.userId}:`, error);
      }
    }
    
    console.log(`Milestone detection: ${successCount} sent, ${noMilestoneCount} no milestones, ${failureCount} failed`);
  } catch (error) {
    console.error('Error in milestone detection job:', error);
  }
};

/**
 * Send personalized carbon reduction suggestions
 */
const sendPersonalizedSuggestions = async () => {
  try {
    // Find users who have opted into suggestion emails
    const preferences = await EmailPreference.find({ suggestionEmails: true });
    
    let successCount = 0;
    let failureCount = 0;
    
    console.log(`Sending personalized suggestions to ${preferences.length} users`);
    
    // Send suggestions to each user
    for (const preference of preferences) {
      try {
        const result = await emailController.sendSuggestionEmail(preference.userId);
        if (result.success) {
          successCount++;
        } else {
          if (result.error !== 'No carbon footprint data found for user') {
            failureCount++;
            console.error(`Failed to send suggestion email to user ${preference.userId}: ${result.error}`);
          }
        }
      } catch (error) {
        failureCount++;
        console.error(`Exception sending suggestion email to user ${preference.userId}:`, error);
      }
    }
    
    console.log(`Personalized suggestions sent: ${successCount} successful, ${failureCount} failed`);
  } catch (error) {
    console.error('Error in personalized suggestions job:', error);
  }
};

/**
 * Detect milestones for a user based on their carbon footprint history
 * @param {string} userId - The user ID to check for milestones
 * @returns {string|null} - The milestone type or null if no milestone detected
 */
const detectMilestone = async (userId) => {
  try {
    // Get carbon footprint history for the user
    const footprints = await CarbonFootprint.find({ userId })
      .sort({ createdAt: 1 });
    
    if (footprints.length < 2) {
      return null; // Not enough data to detect milestones
    }
    
    // Check for first reduction milestone
    const firstReductionMilestone = checkFirstReduction(footprints);
    if (firstReductionMilestone) {
      return 'firstReduction';
    }
    
    // Check for percentage reduction milestones
    const percentageMilestone = checkPercentageReduction(footprints);
    if (percentageMilestone) {
      return percentageMilestone;
    }
    
    // Check for consistent reduction streak
    const consistentReductionMilestone = checkConsistentReduction(footprints);
    if (consistentReductionMilestone) {
      return 'consistentReduction';
    }
    
    return null; // No milestone detected
  } catch (error) {
    console.error(`Error detecting milestone for user ${userId}:`, error);
    return null;
  }
};

/**
 * Check if the user has achieved their first carbon reduction
 */
const checkFirstReduction = (footprints) => {
  if (footprints.length < 2) return false;
  
  // Get the user's first and second footprint records
  const firstRecord = footprints[0];
  const secondRecord = footprints[1];
  
  // Check if there was a reduction
  return secondRecord.totalEmissions < firstRecord.totalEmissions;
};

/**
 * Check if the user has achieved a percentage reduction milestone
 */
const checkPercentageReduction = (footprints) => {
  if (footprints.length < 3) return null;
  
  // Use the first record as the baseline
  const baseline = footprints[0].totalEmissions;
  
  // Get the latest record
  const latest = footprints[footprints.length - 1].totalEmissions;
  
  // Calculate percentage reduction
  const percentageReduction = ((baseline - latest) / baseline) * 100;
  
  // Check for 20% reduction first (bigger milestone)
  if (percentageReduction >= 20) {
    return 'twentyPercentReduction';
  }
  
  // Then check for 10% reduction
  if (percentageReduction >= 10) {
    return 'tenPercentReduction';
  }
  
  return null;
};

/**
 * Check if the user has maintained a consistent reduction for multiple weeks
 */
const checkConsistentReduction = (footprints) => {
  if (footprints.length < 8) return false; // Need at least 8 records (2 months of weekly records)
  
  // Group footprints by week
  const weeklyFootprints = groupFootprintsByWeek(footprints);
  
  // Need at least 4 consecutive weeks of data
  if (weeklyFootprints.length < 4) return false;
  
  // Check the last 4 weeks for consistent reduction
  let consistentReduction = true;
  for (let i = weeklyFootprints.length - 4; i < weeklyFootprints.length - 1; i++) {
    if (weeklyFootprints[i].average >= weeklyFootprints[i - 1].average) {
      consistentReduction = false;
      break;
    }
  }
  
  return consistentReduction;
};

/**
 * Group footprint records by week and calculate average emissions for each week
 */
const groupFootprintsByWeek = (footprints) => {
  const weeklyData = {};
  
  footprints.forEach(footprint => {
    const date = new Date(footprint.createdAt);
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
    const weekKey = weekStart.toISOString().split('T')[0];
    
    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        week: weekKey,
        total: 0,
        count: 0,
        average: 0
      };
    }
    
    weeklyData[weekKey].total += footprint.totalEmissions;
    weeklyData[weekKey].count++;
    weeklyData[weekKey].average = weeklyData[weekKey].total / weeklyData[weekKey].count;
  });
  
  // Convert to array and sort by week
  return Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week));
};

module.exports = {
  initializeSchedulers
}; 