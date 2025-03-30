import BaseApiService from './BaseApiService';

/**
 * Service for test endpoints used in your connection test component
 */
class TestService extends BaseApiService {
    constructor() {
        super('/api');
    }

    /**
     * Test backend connection
     * @returns {Promise} - Promise that resolves with the API response
     */
    testConnection() {
        return this.request('get', '/test');
    }

    /**
     * Test database connection
     * @returns {Promise} - Promise that resolves with the API response
     */
    testDatabaseConnection() {
        return this.request('get', '/test/db');
    }
}

export default new TestService();