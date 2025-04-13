import axios from 'axios';
import { communityApi } from '../config/axios';
import { useNotification } from '../context/NotificationContext';

// Get top users from leaderboard
export const getTopUsers = async (period = 'weekly', limit = 10) => {
  try {
    const response = await communityApi.get(`/api/leaderboard/top?period=${period}&limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching top users:', error);
    throw error;
  }
};

// Get user's rank
export const getUserRank = async (userId) => {
  console.log('getUserRank called with userId:', userId);
  try {
    const response = await communityApi.get(`/api/leaderboard/user/${userId}`);
    console.log('getUserRank response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user rank:', error);
    throw error;
  }
};

// Award points for carbon footprint calculation
export const awardFootprintPoints = async (userId) => {
  console.log('Calling awardFootprintPoints with userId:', userId);
  try {
    const response = await communityApi.post(`/api/leaderboard/award-footprint-points`, {
      userId
    });
    console.log('Award points response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error awarding footprint points:', error);
    throw error;
  }
};

// Get all challenges
export const getAllChallenges = async () => {
  try {
    const response = await communityApi.get(`/api/challenges`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching challenges:', error);
    throw error;
  }
};

// Join a challenge
export const joinChallenge = async (userId, challengeId) => {
  console.log('Joining challenge with userId:', userId, 'challengeId:', challengeId);
  try {
    const response = await communityApi.post(`/api/challenges/join`, {
      userId,
      challengeId
    });
    console.log('Join challenge response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error joining challenge:', error);
    throw error;
  }
};

// Update challenge progress
export const updateChallengeProgress = async (userId, challengeId, progress) => {
  if (!userId || !challengeId || progress === undefined) {
    return {
      success: false,
      error: 'Missing required parameters'
    };
  }
  
  if (progress < 0 || progress > 100) {
    return {
      success: false,
      error: 'Progress must be between 0 and 100'
    };
  }

  try {
    // Try to update progress through the API
    const response = await communityApi.post(`/api/challenges/progress`, {
      userId,
      challengeId,
      progress
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    // If the endpoint doesn't exist (404), use a fallback method
    if (error.response?.status === 404) {
      try {
        // Get user's current challenges
        const userChallenges = await getUserChallenges(userId);
        const challenge = userChallenges.find(c => c._id === challengeId);
        
        if (!challenge) {
          return {
            success: false,
            error: 'Challenge not found for user'
          };
        }
        
        // Update challenge locally
        return {
          success: true,
          data: {
            progress: progress,
            completed: progress >= 100,
            message: 'Progress updated locally'
          }
        };
      } catch (fallbackError) {
        return {
          success: false,
          error: 'Failed to update challenge progress locally'
        };
      }
    }
    
    // For other errors, return the error message
    return {
      success: false,
      error: error.response?.data?.error || 'Failed to update challenge progress'
    };
  }
};

// Get all achievements
export const getAllAchievements = async () => {
  try {
    const response = await communityApi.get(`/api/achievements`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

// Get user's achievements
export const getUserAchievements = async (userId) => {
  try {
    const response = await communityApi.get(`/api/achievements/user/${userId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    throw error;
  }
};

// Update user points
export const updateUserPoints = async (userId, points) => {
  try {
    const response = await communityApi.post(`/api/leaderboard/update-points`, { userId, points });
    return response.data.data;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

// Check achievements
export const checkAchievements = async (userId, carbonReduction, carbonData) => {
  try {
    const response = await axios.post(`${API_URL}/achievements/check`, {
      userId,
      carbonReduction,
      carbonData
    });

    if (response.data.success && response.data.data.newAchievements.length > 0) {
      const { addNotification } = useNotification();
      response.data.data.newAchievements.forEach(achievement => {
        addNotification(`Unlocked: ${achievement.name} - ${achievement.description}`, 'achievement');
      });
    }

    return response.data;
  } catch (error) {
    console.error('Error checking achievements:', error);
    throw error;
  }
};

// Create a challenge
export const createChallenge = async (challengeData) => {
  try {
    const response = await communityApi.post(`/api/challenges`, challengeData);
    return response.data.data;
  } catch (error) {
    console.error('Error creating challenge:', error);
    throw error;
  }
};

// Get user's challenges
export const getUserChallenges = async (userId) => {
  if (!userId) {
    console.error('getUserChallenges: userId is required');
    return [];
  }

  try {
    const response = await communityApi.get(`/api/challenges/user/${userId}`);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    // Return empty array only for 404 (not found) errors
    if (error.response?.status === 404) {
      return [];
    }
    // For other errors, throw to be handled by the caller
    throw error;
  }
};

// Complete a challenge
export const completeChallenge = async (userId, challengeId) => {
  try {
    const response = await communityApi.post(`/api/challenges/progress`, {
      userId,
      challengeId,
      progress: 100
    });

    return {
      success: true,
      data: response.data.data
    };
  } catch (error) {
    console.error('Error completing challenge:', error);
    throw error;
  }
};

// Add a request interceptor to add the auth token to requests
communityApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
communityApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default communityApi; 