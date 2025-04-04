import BaseApiService from './BaseApiService';

/**
 * Service for Document-related API operations
 */
class DocumentService extends BaseApiService {
    constructor() {
        super('/documents');
    }

    /**
     * Upload a document with metadata
     * @param {File} file - Document file
     * @param {Object} metadata - Document metadata
     * @returns {Promise} - Promise that resolves with the API response
     */
    uploadDocument(file, metadata) {
        const formData = new FormData();
        formData.append('file', file);

        // Append all metadata fields to the form data
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        return this.withRetry(() => this.request('post', '/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }));
    }

    /**
     * Get recent documents
     * @param {number} limit - Maximum number of documents to return
     * @returns {Promise} - Promise that resolves with the API response
     */
    getRecentDocuments(limit = 5) {
        return this.getAll({ limit, sort: 'uploadedDate,desc' });
    }

    /**
     * Get documents by type
     * @param {string} type - Document type
     * @returns {Promise} - Promise that resolves with the API response
     */
    getByType(type) {
        return this.getAll({ type });
    }

    /**
     * Get documents by language
     * @param {string} language - Document language
     * @returns {Promise} - Promise that resolves with the API response
     */
    getByLanguage(language) {
        return this.getAll({ language });
    }

    /**
     * Search documents by title
     * @param {string} query - Search query
     * @returns {Promise} - Promise that resolves with the API response
     */
    searchByTitle(query) {
        return this.getAll({ title: query });
    }

    /**
     * Generate questions for a document
     * @param {number} documentId - Document ID
     * @param {Object} options - Generation options
     * @returns {Promise} - Promise that resolves with the API response
     */
    generateQuestions(documentId, options) {
        return this.request('post', `/${documentId}/generate-questions`, options);
    }
}

export default new DocumentService();