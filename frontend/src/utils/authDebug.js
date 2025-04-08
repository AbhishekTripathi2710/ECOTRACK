/**
 * Utility functions to help debug authentication issues
 */

/**
 * Decodes a JWT token and returns its payload without verification
 * @param {string} token - The JWT token to decode
 * @returns {object|null} - The decoded token payload or null if invalid
 */
export function decodeToken(token) {
  try {
    if (!token) return null;
    
    // Split the token into its parts
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (middle part)
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}

/**
 * Checks if the current auth token is valid
 * @returns {object} - Object containing validity and expiration information
 */
export function checkAuthToken() {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    return { 
      valid: false, 
      message: 'No token found'
    };
  }
  
  const decoded = decodeToken(token);
  
  if (!decoded) {
    return {
      valid: false,
      message: 'Token is malformed or invalid'
    };
  }
  
  // Check expiration
  const now = Math.floor(Date.now() / 1000); // Current time in seconds
  const exp = decoded.exp; // Token expiration time
  
  if (exp && exp < now) {
    return {
      valid: false,
      message: 'Token has expired',
      expired: true,
      expirationTime: new Date(exp * 1000)
    };
  }
  
  return {
    valid: true,
    decoded,
    userId: decoded._id || decoded.userId,
    expiresIn: exp ? exp - now : 'unknown'
  };
}

/**
 * Logs detailed authentication information to the console
 */
export function logAuthInfo() {
  const token = localStorage.getItem('authToken');
  console.log('Auth token exists:', !!token);
  
  if (token) {
    const tokenStatus = checkAuthToken();
    console.log('Token status:', tokenStatus);
    
    // Check token format
    console.log('Token format check:');
    console.log('- Starts with "Bearer ":', token.startsWith('Bearer '));
    console.log('- Contains three parts separated by dots:', token.split('.').length === 3);
  }
} 