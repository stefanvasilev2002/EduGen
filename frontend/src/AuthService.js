import {api} from "./services";

const AuthService = {
    register: async (userData) => {
        try {
            const response = await api.post('/api/auth/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    login: async (credentials) => {
        try {
            const response = await api.post('/api/auth/login', credentials);
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        return localStorage.getItem('token') !== null;
    },

    getToken: () => {
        return localStorage.getItem('token');
    }
};

export default AuthService;