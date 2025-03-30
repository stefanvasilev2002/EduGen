import BaseApiService from './BaseApiService';

/**
 * Service for authentication-related endpoints
 * This is a placeholder for future implementation
 */
class AuthService extends BaseApiService {
    constructor() {
        super('/api/auth');
    }

    /**
     * Current user authentication state
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    /**
     * Login user
     * @param {string} username - User's email or username
     * @param {string} password - User's password
     * @returns {Promise} - Promise that resolves with the API response
     */
    login(username, password) {
        return this.request('post', '/login', { username, password })
            .then(response => {
                if (response.data?.token) {
                    localStorage.setItem('token', response.data.token);

                    if (response.data.user) {
                        localStorage.setItem('user', JSON.stringify(response.data.user));
                    }
                }
                return response;
            });
    }

    /**
     * Register new user
     * @param {Object} userData - User registration data
     * @returns {Promise} - Promise that resolves with the API response
     */
    register(userData) {
        return this.request('post', '/register', userData);
    }

    /**
     * Logout user
     * @returns {void}
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    /**
     * Get current user information
     * @returns {Object|null} - User data or null if not authenticated
     */
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            return null;
        }
    }

    /**
     * Check if token is valid (will be implemented later)
     * @returns {Promise} - Promise that resolves with validity status
     */
    validateToken() {
        return this.request('get', '/validate-token');
    }
}

export default new AuthService();