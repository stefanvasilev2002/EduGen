import BaseApiService from './BaseApiService';

/**
 * Service for Quiz-related API operations
 */
class QuizService extends BaseApiService {
    constructor() {
        super('/quizzes');
    }

    /**
     * Get all quizzes
     * @param {Object} params - Query parameters (optional)
     * @returns {Promise} - Promise that resolves with the API response
     */
    getAll(params = {}) {
        return super.getAll(params);
    }

    /**
     * Get a single quiz by ID
     * @param {number} id - Quiz ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    getById(id) {
        return super.getById(id);
    }

    /**
     * Create a new quiz session
     * @param {Object} quizData - Quiz data
     * @param {Array} quizData.questionIds - Array of question IDs
     * @param {Object} quizData.settings - Quiz settings
     * @returns {Promise} - Promise that resolves with the API response
     */
    createQuiz(quizData) {
        return this.post('', quizData);
    }

    /**
     * Submit quiz answers
     * @param {number} quizId - Quiz session ID
     * @param {Object} answers - Object mapping question IDs to answer IDs/values
     * @returns {Promise} - Promise that resolves with the API response
     */
    submitQuizAnswers(quizId, answers) {
        return this.post(`/${quizId}/submit`, { answers });
    }

    /**
     * Get quiz results
     * @param {number} quizId - Quiz session ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    getQuizResults(quizId) {
        return this.get(`/${quizId}/results`);
    }

    /**
     * Get user's quiz history
     * @param {number} userId - User ID (optional, if not provided, gets current user's quizzes)
     * @returns {Promise} - Promise that resolves with the API response
     */
    getUserQuizHistory(userId = null) {
        const endpoint = userId ? `/history/${userId}` : '/history';
        return this.get(endpoint);
    }

    /**
     * Get quiz statistics
     * @param {Object} filters - Statistics filters
     * @param {string} filters.period - Time period (week, month, year, etc.)
     * @param {Array} filters.questionTypes - Filter by question types
     * @param {Array} filters.documentIds - Filter by document IDs
     * @returns {Promise} - Promise that resolves with the API response
     */
    getQuizStatistics(filters = {}) {
        const params = new URLSearchParams();

        if (filters.period) {
            params.append('period', filters.period);
        }

        if (filters.questionTypes && filters.questionTypes.length > 0) {
            filters.questionTypes.forEach(type => {
                params.append('questionTypes', type);
            });
        }

        if (filters.documentIds && filters.documentIds.length > 0) {
            filters.documentIds.forEach(id => {
                params.append('documentIds', id);
            });
        }

        return this.get(`/statistics?${params.toString()}`);
    }

    /**
     * Save quiz session (for partially completed quizzes)
     * @param {number} quizId - Quiz session ID
     * @param {Object} progress - Current quiz progress
     * @returns {Promise} - Promise that resolves with the API response
     */
    saveQuizProgress(quizId, progress) {
        return this.put(`/${quizId}/progress`, progress);
    }

    /**
     * Resume a saved quiz session
     * @param {number} quizId - Quiz session ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    resumeQuiz(quizId) {
        return this.get(`/${quizId}/resume`);
    }

    /**
     * Delete a quiz session
     * @param {number} quizId - Quiz session ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    deleteQuiz(quizId) {
        return this.delete(quizId);
    }

    /**
     * Export quiz results
     * @param {number} quizId - Quiz session ID
     * @param {string} format - Export format ('pdf', 'csv', 'json')
     * @returns {Promise} - Promise that resolves with the API response (blob)
     */
    exportQuizResults(quizId, format = 'pdf') {
        return this.request('get', `/${quizId}/export/${format}`, null, {
            responseType: 'blob'
        });
    }

    /**
     * Get quiz leaderboard
     * @param {Object} filters - Leaderboard filters
     * @param {string} filters.period - Time period
     * @param {number} filters.limit - Number of top entries
     * @param {Array} filters.questionTypes - Filter by question types
     * @returns {Promise} - Promise that resolves with the API response
     */
    getLeaderboard(filters = {}) {
        const params = new URLSearchParams(filters);
        return this.get(`/leaderboard?${params.toString()}`);
    }
}

export default new QuizService();