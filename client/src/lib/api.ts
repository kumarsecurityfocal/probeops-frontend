import axios from 'axios';

// Use our local server as the API endpoint, which will proxy to the AWS server
const API_URL = '';

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Add CORS headers
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  },
  // Important for CORS preflight requests
  withCredentials: false
});

// Request interceptor to add auth token when available
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    let errorMessage = 'An unexpected error occurred';
    
    console.error('Full API Error:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error('API Error Response:', error.response);
      
      // Use the error message from the API if available
      if (error.response.data && (error.response.data.error || error.response.data.message)) {
        errorMessage = error.response.data.error || error.response.data.message;
      } else {
        errorMessage = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API No Response (CORS issue or network error):', error.request);
      errorMessage = 'No response from server. This may be due to CORS restrictions, network issues, or the server is down.';
    } else {
      // Something happened in setting up the request
      console.error('API Request Error:', error.message);
      errorMessage = error.message;
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;

// Authentication API endpoints - using local proxy
export const authAPI = {
  login: (credentials: { username: string; password: string }) => 
    api.post('/proxy/users/login', credentials),
    
  register: (userData: { username: string; email: string; password: string }) => 
    api.post('/proxy/users/register', userData),
    
  getUser: () => 
    api.get('/proxy/users/me'),
    
  logout: () => 
    api.post('/proxy/users/logout')
};

// API Keys endpoints - using local proxy
export const apiKeysAPI = {
  getAll: () => 
    api.get('/proxy/apikeys'),
    
  create: (data: { name: string; description?: string }) => 
    api.post('/proxy/apikeys', data),
    
  delete: (id: number) => 
    api.delete(`/proxy/apikeys/${id}`)
};

// Probe endpoints - using local proxy
export const probesAPI = {
  ping: (data: { host: string }) => 
    api.post('/proxy/probes/ping', data),
    
  traceroute: (data: { host: string }) => 
    api.post('/proxy/probes/traceroute', data),
    
  dns: (data: { domain: string; recordType: string }) => 
    api.post('/proxy/probes/dns', data),
    
  whois: (data: { domain: string }) => 
    api.post('/proxy/probes/whois', data),
    
  getHistory: (limit?: number) => 
    api.get('/proxy/probes/history', { params: limit ? { limit } : {} })
};