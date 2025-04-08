import axiosInstance from '../config/axios';

/**
 * Validates the authentication token
 * @returns {boolean} - Whether the token is valid
 */
const isAuthenticated = () => {
  const token = localStorage.getItem('authToken');
  console.log('Authentication token exists:', !!token);
  return !!token;
};

/**
 * Sends a message to the Gemini AI through the backend
 * @param {string} message - User's message
 * @param {object} userContext - Context with user data for personalized responses
 * @returns {Promise<object>} - AI response
 */
export const sendMessageToGemini = async (message, userContext) => {
  try {
    if (!isAuthenticated()) {
      console.log('No authentication token found for sendMessageToGemini');
      throw new Error('Authentication required');
    }

    console.log('Sending message to Gemini API...');
    const response = await axiosInstance.post('/api/ai/chat', {
      message,
      context: userContext
    });
    
    console.log('Received response from Gemini API');
    return response.data.data;
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Enhance error messages based on response
      if (error.response.status === 500 && error.response.data?.error === 'Failed to get AI response') {
        // Create a custom error with a more informative message
        const customError = new Error('The Gemini API service is not properly configured. Please check the API key in the backend .env file.');
        customError.response = error.response;
        throw customError;
      }
    }
    throw error;
  }
};

/**
 * Fetches the chat history for the current user
 * @returns {Promise<Array>} - Chat history
 */
export const getChatHistory = async () => {
  try {
    if (!isAuthenticated()) {
      console.log('No authentication token found for getChatHistory');
      throw new Error('Authentication required');
    }

    console.log('Fetching chat history...');
    const response = await axiosInstance.get('/api/ai/history');
    console.log('Chat history fetched successfully');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Saves the current chat session
 * @param {Array} messages - Chat messages to save
 * @returns {Promise<object>} - Save response
 */
export const saveChatSession = async (messages) => {
  try {
    if (!isAuthenticated()) {
      console.log('No authentication token found for saveChatSession, skipping');
      return;
    }

    console.log('Saving chat session...');
    const response = await axiosInstance.post('/api/ai/save-session', {
      messages
    });
    console.log('Chat session saved successfully');
    return response.data;
  } catch (error) {
    console.error('Error saving chat session:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Tests the authentication status
 * @returns {Promise<object>} - Authentication test result
 */
export const testAuthentication = async () => {
  try {
    console.log('Testing authentication with token:', localStorage.getItem('authToken'));
    const response = await axiosInstance.get('/api/ai/auth-test');
    console.log('Authentication test successful:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Authentication test failed:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return {
      success: false,
      error: error.message,
      response: error.response
    };
  }
}; 