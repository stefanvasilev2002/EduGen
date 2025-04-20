import BaseApiService from './BaseApiService';

/**
 * Service for Question-related API operations
 */
class QuestionService extends BaseApiService {
    constructor() {
        super('/questions');
    }

    /**
     * Get all questions
     * @param {Object} params - Query parameters (optional)
     * @returns {Promise} - Promise that resolves with the API response
     */
    getAll(params = {}) {
        return super.getAll(params);
    }

    /**
     * Get all questions for a specific document
     * @param {number} documentId - Document ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    getByDocumentId(documentId) {
        return this.getAll({ documentId });
    }

    /**
     * Get questions by type
     * @param {string} type - Question type
     * @returns {Promise} - Promise that resolves with the API response
     */
    getByType(type) {
        return this.getAll({ type });
    }

    /**
     * Create a new question
     * @param {Object} questionData - Question data
     * @returns {Promise} - Promise that resolves with the API response
     */
    createQuestion(questionData) {
        return this.create(questionData);
    }

    /**
     * Update a question
     * @param {number} id - Question ID
     * @param {Object} questionData - Updated question data
     * @returns {Promise} - Promise that resolves with the API response
     */
    updateQuestion(id, questionData) {
        return this.update(id, questionData);
    }

    /**
     * Delete a question
     * @param {number} id - Question ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    deleteQuestion(id) {
        return this.delete(id);
    }

    /**
     * Generate questions for a document
     * @param {number} documentId - Document ID
     * @param {Object} options - Generation options
     * @returns {Promise} - Promise that resolves with the API response
     */
    generateQuestions(documentId, options) {
        return this.request('post', `/generate?documentId=${documentId}`, options);
    }

    /**
     * Get answers for a question
     * @param {number} questionId - Question ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    getAnswers(questionId) {
        return this.request('get', `/${questionId}/answers`);
    }

    /**
     * Add answer to a question
     * @param {number} questionId - Question ID
     * @param {Object} answerData - Answer data
     * @returns {Promise} - Promise that resolves with the API response
     */
    addAnswer(questionId, answerData) {
        return this.request('post', `/${questionId}/answers`, answerData);
    }

    /**
     * Update an answer
     * @param {number} questionId - Question ID
     * @param {number} answerId - Answer ID
     * @param {Object} answerData - Updated answer data
     * @returns {Promise} - Promise that resolves with the API response
     */
    updateAnswer(questionId, answerId, answerData) {
        return this.request('put', `/${questionId}/answers/${answerId}`, answerData);
    }

    /**
     * Delete an answer
     * @param {number} questionId - Question ID
     * @param {number} answerId - Answer ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    deleteAnswer(questionId, answerId) {
        return this.request('delete', `/${questionId}/answers/${answerId}`);
    }

    /**
     * Export questions to PDF
     * @param {Array} questionIds - Array of question IDs to export
     * @returns {Promise} - Promise that resolves with the API response
     */
    exportToPdf(questionIds) {
        return this.request('post', '/export/pdf', { questionIds }, {
            responseType: 'blob'
        });
    }

    /**
     * Export questions to Word document
     * @param {Array} questionIds - Array of question IDs to export
     * @returns {Promise} - Promise that resolves with the API response
     */
    exportToWord(questionIds) {
        return this.request('post', '/export/docx', { questionIds }, {
            responseType: 'blob'
        });
    }
}

export default new QuestionService();