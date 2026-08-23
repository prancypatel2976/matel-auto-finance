import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://matel-auto-finance-pzjo.vercel.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor to attach Authorization Bearer token to all requests from sessionStorage
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('matel_token') || localStorage.getItem('matel_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default api;
