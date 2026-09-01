import axios from 'axios';

// Resolve base URL: use environment variable if provided, or default directly to live Render backend
let rawBaseURL = import.meta.env.VITE_API_URL || 'https://mandal-collection.onrender.com/api';

// Normalize URL: remove trailing slashes and ensure /api path
if (rawBaseURL && rawBaseURL.startsWith('http')) {
  rawBaseURL = rawBaseURL.replace(/\/+$/, '');
  if (!rawBaseURL.endsWith('/api')) {
    rawBaseURL = `${rawBaseURL}/api`;
  }
}

const api = axios.create({
  baseURL: rawBaseURL,
  timeout: 45000, // 45 seconds tolerance for Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mandal_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for session expiration / unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear localStorage and redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('mandal_token');
        localStorage.removeItem('mandal_user');
        window.location.href = '/login?expired=1';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
