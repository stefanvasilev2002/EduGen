import api from './api.config';

/**
 * Base API service with common CRUD operations and retry logic
 */
class BaseApiService {
    constructor(resourcePath) {
        this.resourcePath = resourcePath;
    }

    /**
     * Perform API request with automatic retry for network errors
     * @param {Function} apiCall - Function that returns a promise for the API call
     * @param {number} retries - Number of retries (default: 2)
     * @returns {Promise} - Promise that resolves with the API response
     */
    async withRetry(apiCall, retries = 2) {
        try {
            return await apiCall();
        } catch (error) {
            if (!error.response && retries > 0) {
                console.log(`Retrying request, ${retries} attempts left`);
                return this.withRetry(apiCall, retries - 1);
            }
            throw error;
        }
    }

    /**
     * Get all resources
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise that resolves with the API response
     */
    getAll(params = {}) {
        return this.withRetry(() => api.get(this.resourcePath, { params }));
    }

    /**
     * Get a resource by ID
     * @param {string|number} id - Resource ID
     * @param {Object} params - Query parameters
     * @returns {Promise} - Promise that resolves with the API response
     */
    getById(id, params = {}) {
        return this.withRetry(() => api.get(`${this.resourcePath}/${id}`, { params }));
    }

    /**
     * Create a new resource
     * @param {Object} data - Resource data
     * @returns {Promise} - Promise that resolves with the API response
     */
    create(data) {
        return this.withRetry(() => api.post(this.resourcePath, data));
    }

    /**
     * Update a resource
     * @param {string|number} id - Resource ID
     * @param {Object} data - Resource data
     * @returns {Promise} - Promise that resolves with the API response
     */
    update(id, data) {
        return this.withRetry(() => api.put(`${this.resourcePath}/${id}`, data));
    }

    /**
     * Delete a resource
     * @param {string|number} id - Resource ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    delete(id) {
        return this.withRetry(() => api.delete(`${this.resourcePath}/${id}`));
    }

    /**
     * Make a custom request
     * @param {string} method - HTTP method
     * @param {string} url - URL path (appended to resourcePath)
     * @param {Object} data - Request data
     * @param {Object} config - Axios request config
     * @returns {Promise} - Promise that resolves with the API response
     */
    request(method, url, data = null, config = {}) {
        const fullUrl = `${this.resourcePath}${url}`;
        return this.withRetry(() => api.request({
            method,
            url: fullUrl,
            data,
            ...config
        }));
    }
}

export default BaseApiService;