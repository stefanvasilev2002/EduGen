import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

api.interceptors.request.use(
    (config) => {
        // Get token from localStorage (will be implemented once auth is ready)
        const token = localStorage.getItem('token');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            // This will be implemented once auth is ready on backend
            // For now, we'll just log the user out

            originalRequest._retry = true;

            localStorage.removeItem('token');

            // window.location.href = '/login';
        }

        if (error.response?.status >= 500) {
            console.error('Server error:', error.response?.data);
        }

        return Promise.reject(error);
    }
);

export default api;