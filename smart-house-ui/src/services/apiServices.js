import axios from 'axios';

// Base URL for the API
const API_BASE_URL = 'http://microservices.local'; // Replace with your actual base URL

// Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add the Authorization header to all requests except login and signup
apiClient.interceptors.request.use((config) => {
  if (!config.url.includes('/user/login') && !config.url.includes('/auth/signup')) {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => Promise.reject(error));

// Response interceptor to handle token storage on login/signup
apiClient.interceptors.response.use((response) => {
  if (response.config.url.includes('/user/login') || response.config.url.includes('/user')) {
    const token = response.data?.data?.token; // Extract the token from the response
    if (token) {
      localStorage.setItem('authToken', token); // Save the token to localStorage
    }
  }
  return response;
}, (error) => Promise.reject(error));

export const apiService = {
  // Auth APIs
  login: (credentials) => apiClient.post('/api/v1/user/login', credentials),
  signup: (userData) => apiClient.post('/api/v1/user', userData),
  logout: () => apiClient.post('/api/v1/user/logout'),
  getDevices: () => apiClient.get('/api/v1/device-register'),

  // Device Management APIs
  registerDevice: (deviceData) => apiClient.post('/api/v1/device-register', [deviceData]),
  // Device Management APIs
  getDeviceUsage: (deviceId, startTime, endTime) =>
    apiClient.get(`api/v1/analytics/usage/${deviceId}?startTime=${startTime}&endTime=${endTime}`),
  getAnalyticsReport: (deviceId, startDate, endDate) =>
    apiClient.get(`api/v1/analytics/report/${deviceId}?startDate=${startDate}&endDate=${endDate}`),
  getCarbonFootprint: (deviceId, startDate, endDate) =>
    apiClient.get(`api/v1/analytics/env-footprint/${deviceId}?startDate=${startDate}&endDate=${endDate}`),
  getDeviceAnalytics: () => apiClient.get('/device/analytics'),
  getMaintenanceReport: (deviceId) => apiClient.get(`/api/v1/analytics/maintenance/${deviceId}`),
  executeCommand: (id, category, command, value) => apiClient.post('/api/v1/device-control/commands', { id, category, command, value }),
  updateDevice: (deviceId, deviceUpdateData) => apiClient.put(`/api/v1/device-register/${deviceId}`, deviceUpdateData),
  deleteDevice: (deviceId) => apiClient.delete(`/api/v1/device-register/${deviceId}`)
};
