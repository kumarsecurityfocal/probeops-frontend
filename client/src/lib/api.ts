import axios from 'axios';

// Use local server which proxies to AWS backend
const API_URL = '';

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  // Important for CORS when server has Access-Control-Allow-Credentials: true
  withCredentials: true
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

// Authentication API endpoints - direct connection to AWS backend
export const authAPI = {
  login: (credentials: { username: string; password: string }) => 
    api.post('/users/login', credentials),
    
  register: (userData: { username: string; email: string; password: string }) => 
    api.post('/users/register', userData),
    
  getUser: () => 
    api.get('/users/me'),
    
  logout: () => 
    api.post('/users/logout')
};

// API Keys endpoints - direct connection to AWS backend
export const apiKeysAPI = {
  getAll: () => 
    api.get('/apikeys'),
    
  create: (data: { name: string; description?: string }) => 
    api.post('/apikeys', data),
    
  delete: (id: number) => 
    api.delete(`/apikeys/${id}`)
};

// Probe endpoints - direct connection to AWS backend
export const probesAPI = {
  ping: (data: { host: string }) => 
    api.post('/probes/ping', data),
    
  traceroute: (data: { host: string }) => 
    api.post('/probes/traceroute', data),
    
  dns: (data: { domain: string; recordType: string }) => 
    api.post('/probes/dns', data),
    
  whois: (data: { domain: string }) => 
    api.post('/probes/whois', data),
    
  getHistory: (limit?: number) => 
    api.get('/probes/history', { params: limit ? { limit } : {} })
};