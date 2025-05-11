import api from './api.config';
import { jwtDecode } from 'jwt-decode';

const AuthService = {
    register: async (userData) => {
        try {
            console.log("Register data being sent:", JSON.stringify(userData));
            const response = await api.post('/auth/register', userData);
            return response.data;
        } catch (error) {
            console.error('Register error details:', error.response?.data);
            throw error;
        }
    },
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            console.error('Login error details:', error.response?.data);
            throw error;
        }
    },
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    },

    checkTokenExpiration: () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const currentTime = Date.now() / 1000;

                if (decodedToken.exp < currentTime) {
                    console.log('Token expired, logging out...');
                    AuthService.logout();
                    return false;
                }
                return true;
            } catch (error) {
                console.error('Error decoding token:', error);
                AuthService.logout();
                return false;
            }
        }
        return false;
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token') && AuthService.checkTokenExpiration();
    }
};

export default AuthService;