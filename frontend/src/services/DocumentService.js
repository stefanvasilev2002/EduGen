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

        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        return this.withRetry(() => this.request('post', '/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: progressEvent => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                console.log(`Upload progress: ${percentCompleted}%`);
            }
        }));
    }

    /**
     * Update a document - special method to match backend expectations
     * @param {string|number} id - Document ID
     * @param {URLSearchParams} params - Document parameters
     * @returns {Promise} - Promise that resolves with the API response
     */
    updateDocument(id, updateData) {
        const data = {};
        if (updateData instanceof URLSearchParams) {
            for (const [key, value] of updateData.entries()) {
                data[key] = value;
            }
        } else {
            Object.assign(data, updateData);
        }

        return this.withRetry(() => this.request('put', `/${id}`, data));
    }

    /**
     * Download a document
     * @param {string|number} id - Document ID
     * @returns {Promise} - Promise that resolves with the API response containing a blob
     */
    downloadDocument(id) {
        return this.withRetry(() => this.request('get', `/${id}/download`, null, {
            responseType: 'blob'
        }));
    }

    /**
     * Get document content for preview
     * @param {string|number} id - Document ID
     * @returns {Promise} - Promise that resolves with the API response containing the document content
     */
    getDocumentContent(id) {
        return this.withRetry(() => this.request('get', `/${id}/content`));
    }

    /**
     * View document in browser
     * @param {string|number} id - Document ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    viewDocument(id) {
        return this.withRetry(() => this.request('get', `/${id}/view`));
    }

    /**
     * Get document metadata
     * @param {string|number} id - Document ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    getDocumentMetadata(id) {
        return this.withRetry(() => this.request('get', `/${id}/metadata`));
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
     * Delete a document
     * @param {number} id - Document ID
     * @returns {Promise} - Promise that resolves with the API response
     */
    deleteDocument(id) {
        return this.delete(id);
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