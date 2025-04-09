import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFile, FiCheckCircle, FiAlertTriangle, FiTrash } from 'react-icons/fi';
import { DocumentService } from '../../services';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const DocumentUpload = () => {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [documentMetadata, setDocumentMetadata] = useState({
        title: '',
        language: 'en',
        type: 'LECTURE',
        format: 'PDF'
    });

    const onDrop = useCallback(acceptedFiles => {
        setUploadProgress(0);
        setUploadStatus(null);
        setErrorMessage('');

        const selectedFile = acceptedFiles[0];

        if (selectedFile.size > MAX_FILE_SIZE) {
            setErrorMessage(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
            setUploadStatus('error');
            return;
        }

        const fileExt = selectedFile.name.split('.').pop().toLowerCase();
        if (!['pdf', 'docx', 'txt'].includes(fileExt)) {
            setErrorMessage('Unsupported file format. Please upload PDF, DOCX, or TXT files.');
            setUploadStatus('error');
            return;
        }

        setFile(selectedFile);
        setDocumentMetadata({
            ...documentMetadata,
            title: selectedFile.name.split('.')[0],
            format: fileExt.toUpperCase()
        });
    }, [documentMetadata]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        },
        maxSize: MAX_FILE_SIZE,
        multiple: false
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDocumentMetadata({
            ...documentMetadata,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file) {
            setErrorMessage('Please select a file to upload.');
            setUploadStatus('error');
            return;
        }

        setIsUploading(true);
        setUploadStatus(null);
        setErrorMessage('');

        try {
            await DocumentService.uploadDocument(file, {
                userId: 1,
                title: documentMetadata.title,
                language: documentMetadata.language,
                type: documentMetadata.type,
                format: documentMetadata.format
            });

            setUploadStatus('success');
            setTimeout(() => {
                resetForm();
            }, 2000);
        } catch (error) {
            setUploadStatus('error');
            setErrorMessage(
                error.response?.data?.message ||
                'An error occurred while uploading the file. Please try again.'
            );
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setUploadProgress(0);
        setUploadStatus(null);
        setErrorMessage('');
        setDocumentMetadata({
            title: '',
            language: 'en',
            type: 'LECTURE',
            format: 'PDF'
        });
    };

    const handleRemoveFile = () => {
        setFile(null);
        setUploadProgress(0);
        setUploadStatus(null);
        setErrorMessage('');
    };

    return (
        <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Upload Document</h2>

            {!file ? (
                <div className="mb-6">
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                        }`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center">
                            <FiUpload className="text-4xl text-gray-400 mb-3" />
                            <p className="text-gray-600 mb-2">
                                {isDragActive
                                    ? 'Drop the file here'
                                    : 'Drag & drop your document here'}
                            </p>
                            <p className="text-gray-500 text-sm mb-4">Supported formats: PDF, DOCX, TXT (Max 5MB)</p>
                            <button
                                type="button"
                                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Browse files
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <FiFile className="text-2xl text-blue-500 mr-3" />
                            <div>
                                <p className="font-medium">{file.name}</p>
                                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            className="text-gray-500 hover:text-red-500"
                            onClick={handleRemoveFile}
                        >
                            <FiTrash />
                        </button>
                    </div>
                </div>
            )}

            {/* Error message */}
            {uploadStatus === 'error' && (
                <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <FiAlertTriangle className="mr-2" />
                    {errorMessage}
                </div>
            )}

            {/* Success message */}
            {uploadStatus === 'success' && (
                <div className="mb-6 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
                    <FiCheckCircle className="mr-2" />
                    Document uploaded successfully!
                </div>
            )}

            {/* Progress bar */}
            {isUploading && (
                <div className="mb-6">
                    <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Uploading...</span>
                        <span className="text-sm font-medium text-gray-700">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Document metadata form */}
            {file && (
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                            Document Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={documentMetadata.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="language" className="block text-gray-700 font-medium mb-2">
                            Language
                        </label>
                        <select
                            id="language"
                            name="language"
                            value={documentMetadata.language}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="it">Italian</option>
                            <option value="mk">Macedonian</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
                            Document Type
                        </label>
                        <select
                            id="type"
                            name="type"
                            value={documentMetadata.type}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="LECTURE">Lecture</option>
                            <option value="BOOK">Book</option>
                            <option value="ARTICLE">Article</option>
                            <option value="NOTES">Notes</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="mr-3 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                            disabled={isUploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Document'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default DocumentUpload;