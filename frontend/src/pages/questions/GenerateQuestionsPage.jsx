import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiFileText,
    FiSettings,
    FiList,
    FiCheckCircle,
    FiAlertCircle,
    FiCpu,
    FiLoader
} from 'react-icons/fi';
import { DocumentService, QuestionService } from '../../services';
import { useAuth } from '../../components/auth/AuthContext';

const GenerateQuestionsPage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [selectedDocument, setSelectedDocument] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [generationSettings, setGenerationSettings] = useState({
        questionCount: 5,
        difficultyLevel: 'MEDIUM',
        questionTypes: ['MULTIPLE_CHOICE', 'TRUE_FALSE'],
        includeAnswers: true,
        language: 'en'
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/questions/generate' } });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await DocumentService.getAll();
                setDocuments(response.data || []);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching documents:', err);
                setError('Failed to load documents. Please try again.');
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchDocuments();
        }
    }, [isAuthenticated, user]);

    const handleSelectDocument = (document) => {
        setSelectedDocument(document);
    };

    const handleSettingsChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'questionTypes') {
            const updatedTypes = [...generationSettings.questionTypes];
            if (checked) {
                if (!updatedTypes.includes(value)) {
                    updatedTypes.push(value);
                }
            } else {
                const index = updatedTypes.indexOf(value);
                if (index !== -1) {
                    updatedTypes.splice(index, 1);
                }
            }

            setGenerationSettings({
                ...generationSettings,
                questionTypes: updatedTypes
            });
        } else {
            setGenerationSettings({
                ...generationSettings,
                [name]: type === 'checkbox' ? checked : value
            });
        }
    };

    const handleGenerateQuestions = async () => {
        if (!selectedDocument) {
            setError('Please select a document first.');
            return;
        }

        if (generationSettings.questionTypes.length === 0) {
            setError('Please select at least one question type.');
            return;
        }

        try {
            setIsGenerating(true);
            setError(null);
            setSuccess(null);

            const response = await QuestionService.generateQuestions(
                selectedDocument.id,
                generationSettings
            );

            setSuccess('Questions generated successfully! You can now view them in the Questions tab.');
            setIsGenerating(false);

            setTimeout(() => {
                navigate('/questions');
            }, 2000);

        } catch (err) {
            console.error('Error generating questions:', err);
            let errorMessage = 'Failed to generate questions. Please try again.';

            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
            setIsGenerating(false);
        }
    };

    const getDocumentTypeName = (type) => {
        if (!type) return 'Unknown';
        return type.charAt(0) + type.slice(1).toLowerCase();
    };

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (e) {
            return 'Invalid date';
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-6 text-gray-800">Generate Questions</h2>

            {/* Error message */}
            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <FiAlertCircle className="mr-2" />
                    <span>{error}</span>
                </div>
            )}

            {/* Success message */}
            {success && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
                    <FiCheckCircle className="mr-2" />
                    <span>{success}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Document Selection */}
                <div className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex items-center mb-4">
                        <FiFileText className="text-blue-500 mr-2" />
                        <h3 className="text-lg font-medium text-gray-800">Select Document</h3>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 mb-4">No documents found</p>
                            <button
                                onClick={() => navigate('/documents/upload')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Upload a Document
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 mt-4 max-h-96 overflow-y-auto pr-2">
                            {documents.map((document) => (
                                <div
                                    key={document.id}
                                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                        selectedDocument?.id === document.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                                    }`}
                                    onClick={() => handleSelectDocument(document)}
                                >
                                    <div className="flex items-center mb-2">
                                        <FiFileText className="text-gray-500 mr-2" />
                                        <h4 className="font-medium text-gray-800">{document.title}</h4>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                        <div>Type: <span className="text-gray-700">{getDocumentTypeName(document.type)}</span></div>
                                        <div>Format: <span className="text-gray-700">{document.format}</span></div>
                                        <div>Language: <span className="text-gray-700">{document.language}</span></div>
                                        <div>Uploaded: <span className="text-gray-700">{formatDate(document.uploadedDate)}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Generation Settings */}
                <div className="bg-gray-50 p-5 rounded-lg">
                    <div className="flex items-center mb-4">
                        <FiSettings className="text-blue-500 mr-2" />
                        <h3 className="text-lg font-medium text-gray-800">Generation Settings</h3>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Questions
                            </label>
                            <input
                                type="number"
                                id="questionCount"
                                name="questionCount"
                                min="1"
                                max="50"
                                value={generationSettings.questionCount}
                                onChange={handleSettingsChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="difficultyLevel" className="block text-sm font-medium text-gray-700 mb-1">
                                Difficulty Level
                            </label>
                            <select
                                id="difficultyLevel"
                                name="difficultyLevel"
                                value={generationSettings.difficultyLevel}
                                onChange={handleSettingsChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                                <option value="MIXED">Mixed Difficulty</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                                Language
                            </label>
                            <select
                                id="language"
                                name="language"
                                value={generationSettings.language}
                                onChange={handleSettingsChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="English">English</option>
                                <option value="Macedonian">Macedonian</option>
                            </select>
                        </div>

                        <div>
                            <p className="block text-sm font-medium text-gray-700 mb-2">Question Types</p>
                            <div className="space-y-2">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="typeMultipleChoice"
                                        name="questionTypes"
                                        value="MULTIPLE_CHOICE"
                                        checked={generationSettings.questionTypes.includes('MULTIPLE_CHOICE')}
                                        onChange={handleSettingsChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="typeMultipleChoice" className="ml-2 text-sm text-gray-700">
                                        Multiple Choice
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="typeTrueFalse"
                                        name="questionTypes"
                                        value="TRUE_FALSE"
                                        checked={generationSettings.questionTypes.includes('TRUE_FALSE')}
                                        onChange={handleSettingsChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="typeTrueFalse" className="ml-2 text-sm text-gray-700">
                                        True/False
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="typeFillBlank"
                                        name="questionTypes"
                                        value="FILL_IN_THE_BLANK"
                                        checked={generationSettings.questionTypes.includes('FILL_IN_THE_BLANK')}
                                        onChange={handleSettingsChange}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor="typeFillBlank" className="ml-2 text-sm text-gray-700">
                                        Fill in the Blank
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="includeAnswers"
                                name="includeAnswers"
                                checked={generationSettings.includeAnswers}
                                onChange={handleSettingsChange}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="includeAnswers" className="ml-2 text-sm text-gray-700">
                                Include Answers
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={() => navigate('/documents')}
                    className="px-4 py-2 mr-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    disabled={isGenerating}
                >
                    Cancel
                </button>
                <button
                    onClick={handleGenerateQuestions}
                    disabled={!selectedDocument || isGenerating || generationSettings.questionTypes.length === 0}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <>
                            <FiLoader className="animate-spin mr-2" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <FiCpu className="mr-2" />
                            Generate Questions
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default GenerateQuestionsPage;