import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
  
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    // Don't log 401 errors for auth/me endpoint during initial load
    if (error.response?.status === 401 && error.config?.url?.includes('/api/auth/me')) {
      return Promise.reject(error);
    }

    // Log error response in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`API Error: ${error.response?.status || 'No Response'} ${error.config?.url}`, {
        message: error.message,
        data: error.response?.data,
        status: error.response?.status
      });
    }

    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      // Handle specific error cases
      switch (status) {
        case 401:
          console.error('Unauthorized - User not authenticated');
          break;
        case 403:
          console.error('Forbidden - User not authorized');
          break;
        case 404:
          console.error('Not Found - Resource not found');
          break;
        case 500:
          console.error('Internal Server Error');
          break;
        default:
          console.error(`HTTP Error ${status}:`, data);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error - No response received');
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
