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
     * Get a single question by ID
     * @param {number} id - Question ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    getById(id) {
        return super.getById(id);
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
     * @param {URLSearchParams|Object|FormData} questionData - Question data
     * @returns {Promise} - Promise that resolves with the API response
     */
    createQuestion(questionData) {
        let formData;

        if (questionData instanceof URLSearchParams) {
            formData = questionData;
        } else if (questionData instanceof FormData) {
            formData = questionData;
        } else {
            formData = new URLSearchParams();
            Object.keys(questionData).forEach(key => {
                formData.append(key, questionData[key]);
            });
        }

        console.log('Creating question with data:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        return this.request('post', '', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
    }

    /**
     * Update a question
     * @param {number} id - Question ID
     * @param {URLSearchParams|Object|FormData} questionData - Updated question data
     * @returns {Promise} - Promise that resolves with the API response
     */
    updateQuestion(id, questionData) {
        let formData;

        if (questionData instanceof URLSearchParams) {
            formData = questionData;
        } else if (questionData instanceof FormData) {
            formData = questionData;
        } else {
            formData = new URLSearchParams();
            Object.keys(questionData).forEach(key => {
                formData.append(key, questionData[key]);
            });
        }

        console.log('Updating question with ID:', id);
        console.log('Update data:');
        for (let [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`);
        }

        return this.request('put', `/${id}`, formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
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