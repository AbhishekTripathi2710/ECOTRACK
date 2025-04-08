import axios from 'axios';
import { communityApi } from '../config/axios';

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
  try {
    console.log('Updating challenge progress:', { userId, challengeId, progress });
    const response = await communityApi.post(`/api/challenges/progress`, {
      userId,
      challengeId,
      progress
    });
    console.log('Update progress response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating challenge progress:', error);
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
export const checkAchievements = async (userId, carbonData = null) => {
  try {
    // Calculate carbon reduction if we have history data
    let carbonReduction = null;
    if (carbonData && carbonData.history && carbonData.history.length >= 2) {
      const sortedHistory = [...carbonData.history].sort((a, b) => 
        new Date(a.date) - new Date(b.date));
      
      const firstReading = sortedHistory[0].carbonFootprint;
      const lastReading = sortedHistory[sortedHistory.length - 1].carbonFootprint;
      
      if (firstReading > 0) {
        carbonReduction = ((firstReading - lastReading) / firstReading) * 100;
        // Make sure it's not negative (increased footprint)
        carbonReduction = Math.max(0, carbonReduction);
      }
    }

    const response = await communityApi.post(`/api/achievements/check`, { 
      userId,
      carbonReduction,
      carbonData
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Error checking achievements:', error);
    return [];
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
  console.log('Getting challenges for user:', userId);
  try {
    const response = await communityApi.get(`/api/challenges/user/${userId}`);
    console.log('User challenges response:', response.data);
    console.log('User challenges data type:', typeof response.data.data);
    console.log('User challenges data length:', response.data.data.length);
    console.log('First user challenge:', response.data.data[0]);
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching user challenges:', error);
    return [];
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