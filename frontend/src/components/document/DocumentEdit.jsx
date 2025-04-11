import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    FiSave,
    FiFileText,
    FiAlertCircle,
    FiCheckCircle,
    FiX
} from 'react-icons/fi';
import { DocumentService } from '../../services';

const DocumentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [document, setDocument] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        language: 'en',
        type: 'LECTURE',
        format: 'PDF',
        filePath: ''
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'mk', name: 'Macedonian' }
    ];

    const types = [
        { value: 'TEXTBOOK', label: 'Textbook' },
        { value: 'SCRIPT', label: 'Script' },
        { value: 'LECTURE', label: 'Lecture' },
        { value: 'RESEARCH', label: 'Research' },
        { value: 'OTHER', label: 'Other' }
    ];

    const formats = ['PDF', 'DOCX', 'TXT'];

    useEffect(() => {
        fetchDocument();
    }, [id]);

    const fetchDocument = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const response = await DocumentService.getById(id);
            const documentData = response.data;

            setDocument(documentData);
            setFormData({
                title: documentData.title || '',
                language: documentData.language || 'en',
                type: documentData.type || 'LECTURE',
                format: documentData.format || 'PDF',
                filePath: documentData.filePath || ''
            });

            setIsLoading(false);
        } catch (err) {
            console.error('Error fetching document:', err);
            setError('Failed to load document. Please try again.');
            setIsLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSaving(true);
            setError(null);
            setSuccessMessage(null);

            const updateData = {
                title: formData.title,
                language: formData.language,
                type: formData.type
            };

            const response = await DocumentService.updateDocument(id, updateData);

            setDocument(response.data);
            setSuccessMessage('Document updated successfully!');

            setTimeout(() => {
                setSuccessMessage(null);
            }, 2000);

            setIsSaving(false);
        } catch (err) {
            console.error('Error updating document:', err);
            setError('Failed to update document. Please try again.');
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        navigate('/documents');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Edit Document</h2>

                <button
                    onClick={handleCancel}
                    className="text-gray-500 hover:text-gray-700"
                >
                    <FiX className="h-5 w-5" />
                </button>
            </div>

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <FiAlertCircle className="mr-2" />
                    <span>{error}</span>
                </div>
            )}

            {/* Success message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
                    <FiCheckCircle className="mr-2" />
                    <span>{successMessage}</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {document ? (
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <div className="mb-4">
                                        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                                            Document Title
                                        </label>
                                        <input
                                            type="text"
                                            id="title"
                                            name="title"
                                            value={formData.title}
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
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {languages.map(language => (
                                                <option key={language.code} value={language.code}>
                                                    {language.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-4">
                                        <label htmlFor="type" className="block text-gray-700 font-medium mb-2">
                                            Document Type
                                        </label>
                                        <select
                                            id="type"
                                            name="type"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {types.map(type => (
                                                <option key={type.value} value={type.value}>
                                                    {type.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="format" className="block text-gray-700 font-medium mb-2">
                                            Format
                                        </label>
                                        <select
                                            id="format"
                                            name="format"
                                            value={formData.format}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            disabled
                                        >
                                            {formats.map(format => (
                                                <option key={format} value={format}>
                                                    {format}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                <div className="flex items-center">
                                    <FiFileText className="text-2xl text-blue-500 mr-3" />
                                    <div>
                                        <p className="font-medium">{document.title}</p>
                                        <p className="text-sm text-gray-500">Original filename ({document.format})</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="mr-3 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors flex items-center"
                                    disabled={isSaving}
                                >
                                    {isSaving ? 'Saving...' : (
                                        <>
                                            <FiSave className="mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-16">
                            <p className="text-gray-500">Document not found</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default DocumentEdit;