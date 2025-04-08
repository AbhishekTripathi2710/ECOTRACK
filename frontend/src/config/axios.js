import axios from "axios";

// Enable request debugging
const DEBUG_REQUESTS = true;

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Create a separate instance for community service
const communityApi = axios.create({
  baseURL: 'http://localhost:5002',
});

// Add a request interceptor for the main API
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Add Bearer prefix if not present
      const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = authToken;
      
      if (DEBUG_REQUESTS) {
        console.log(`Request to ${config.url} with token:`, authToken.substring(0, 20) + '...');
      }
    } else if (DEBUG_REQUESTS) {
      console.log(`Request to ${config.url} without authentication token`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    if (DEBUG_REQUESTS) {
      console.log(`Response from ${response.config.url}:`, response.status);
    }
    return response;
  },
  (error) => {
    if (DEBUG_REQUESTS && error.response) {
      console.error(`Error response from ${error.config.url}:`, {
        status: error.response.status,
        data: error.response.data
      });
    }
    if (error.response?.status === 401) {
      // Clear token and redirect to login on unauthorized
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Add a request interceptor for the community API
communityApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // Ensure token is properly formatted
      const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
      config.headers.Authorization = formattedToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export { axiosInstance as default, communityApi };