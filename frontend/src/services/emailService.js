import axios from '../config/axios';

/**
 * Get the current user's email notification preferences
 * @returns {Promise<Object>} The user's email preferences
 */
export const getEmailPreferences = async () => {
  try {
    const response = await axios.get('/api/email/preferences');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching email preferences:', error);
    throw error;
  }
};

/**
 * Update the user's email notification preferences
 * @param {Object} preferences - Object containing preference settings to update
 * @returns {Promise<Object>} The updated email preferences
 */
export const updateEmailPreferences = async (preferences) => {
  try {
    const response = await axios.put('/api/email/preferences', preferences);
    return response.data.data;
  } catch (error) {
    console.error('Error updating email preferences:', error);
    throw error;
  }
};

/**
 * Send a test email to the user
 * @param {string} emailType - The type of email to send as a test
 * Valid types: 'weeklyReport', 'milestoneAlert', 'suggestionEmail', 
 * 'challengeReminder', 'achievementUnlocked', 'newChallengeAlert', 
 * 'weeklyEcoTips', 'educationalContent'
 * @returns {Promise<Object>} Result of the test email operation
 */
export const sendTestEmail = async (emailType = 'weeklyReport') => {
  try {
    console.log(`Sending test email of type: ${emailType}`);
    const response = await axios.post('/api/email/test', { emailType });
    console.log('Test email response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending test email:', error);
    
    // Extract the error message from the response if available
    const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Unknown error sending test email';
                         
    // Re-throw with a clear message
    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    throw enhancedError;
  }
}; 