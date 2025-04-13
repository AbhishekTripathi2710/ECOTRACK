import axiosInstance from '../config/axios';

/**
 * Request an OTP for login
 * @param {string} email - User's email address
 * @returns {Promise<object>} Response containing success status
 */
export const requestOTP = async (email) => {
    try {
        const response = await axiosInstance.post('/api/users/request-otp', { email });
        return response.data;
    } catch (error) {
        console.error('Error requesting OTP:', error);
        throw error;
    }
};

/**
 * Verify the OTP and complete login
 * @param {string} email - User's email address
 * @param {string} otp - One-time password
 * @returns {Promise<object>} Response containing token and user data
 */
export const verifyOTP = async (email, otp) => {
    try {
        const response = await axiosInstance.post('/api/users/verify-otp', { email, otp });
        return response.data;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
}; 