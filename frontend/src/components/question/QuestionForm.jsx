import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FiSave,
    FiX,
    FiPlus,
    FiTrash2,
    FiAlertCircle,
    FiCheckCircle,
} from 'react-icons/fi';
import { QuestionService, DocumentService } from '../../services';
import { useAuth } from '../../components/auth/AuthContext';

const QuestionForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { isAuthenticated } = useAuth();

    const [question, setQuestion] = useState({
        text: '',
        type: 'MULTIPLE_CHOICE',
        documentId: '',
        answers: []
    });

    const [documents, setDocuments] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const questionTypes = [
        { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice' },
        { value: 'TRUE_FALSE', label: 'True/False' },
        { value: 'FILL_IN_THE_BLANK', label: 'Fill in the Blank' },
    ];

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const loadData = async () => {
            try {
                setIsLoading(true);

                const documentsResponse = await DocumentService.getAll();
                setDocuments(documentsResponse.data || []);

                if (isEdit) {
                    console.log('Loading question with ID:', id);
                    const questionResponse = await QuestionService.getById(id);
                    console.log('Question response:', questionResponse);

                    if (questionResponse.data) {
                        const existingQuestion = questionResponse.data;
                        console.log('Existing question:', existingQuestion);

                        const convertedAnswers = existingQuestion.answers ? existingQuestion.answers.map(answer => ({
                            id: answer.id,
                            text: answer.text,
                            isCorrect: answer.correct
                        })) : [];

                        setQuestion({
                            text: existingQuestion.text || '',
                            type: existingQuestion.type || 'MULTIPLE_CHOICE',
                            documentId: existingQuestion.documentId || '',
                            answers: convertedAnswers
                        });
                    }
                }
            } catch (err) {
                console.error('Error loading data:', err);
                setError('Failed to load data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id, isEdit, isAuthenticated, navigate]);

    useEffect(() => {
        if (isEdit && question.answers && question.answers.length > 0) {
            return;
        }

        if (!isEdit || question.answers.length === 0) {
            switch (question.type) {
                case 'MULTIPLE_CHOICE':
                    setQuestion(prev => ({
                        ...prev,
                        answers: Array(4).fill(null).map(() => ({
                            id: null,
                            text: '',
                            isCorrect: false
                        }))
                    }));
                    break;
                case 'TRUE_FALSE':
                    setQuestion(prev => ({
                        ...prev,
                        answers: [
                            { id: null, text: 'True', isCorrect: false },
                            { id: null, text: 'False', isCorrect: false }
                        ]
                    }));
                    break;
                case 'FILL_IN_THE_BLANK':
                    setQuestion(prev => ({
                        ...prev,
                        answers: [{ id: null, text: '', isCorrect: true }]
                    }));
                    break;
                default:
                    setQuestion(prev => ({
                        ...prev,
                        answers: []
                    }));
            }
        }
    }, [question.type, isEdit]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setQuestion(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleAnswerChange = (index, field, value) => {
        const updatedAnswers = [...question.answers];
        updatedAnswers[index] = {
            ...updatedAnswers[index],
            [field]: value
        };

        if (question.type === 'TRUE_FALSE' && field === 'isCorrect' && value) {
            updatedAnswers.forEach((answer, idx) => {
                if (idx !== index) {
                    answer.isCorrect = false;
                }
            });
        }

        setQuestion(prev => ({
            ...prev,
            answers: updatedAnswers
        }));
    };

    const addAnswer = () => {
        setQuestion(prev => ({
            ...prev,
            answers: [...prev.answers, { id: null, text: '', isCorrect: false }]
        }));
    };

    const removeAnswer = (index) => {
        if (question.answers.length > 1) {
            setQuestion(prev => ({
                ...prev,
                answers: prev.answers.filter((_, idx) => idx !== index)
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!question.text.trim()) {
            newErrors.text = 'Question text is required';
        }

        if (!question.documentId) {
            newErrors.documentId = 'Please select a document';
        }

        if (['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_THE_BLANK'].includes(question.type)) {
            if (question.answers.length === 0) {
                newErrors.answers = 'At least one answer is required';
            } else {
                const hasCorrectAnswer = question.answers.some(answer => answer.isCorrect);
                if (!hasCorrectAnswer) {
                    newErrors.answers = 'At least one answer must be marked as correct';
                }

                if (question.type === 'MULTIPLE_CHOICE') {
                    const emptyAnswers = question.answers.some(answer => !answer.text.trim());
                    if (emptyAnswers) {
                        newErrors.answers = 'All answers must have text';
                    }
                }

                if (question.type === 'FILL_IN_THE_BLANK') {
                    if (!question.answers[0].text.trim()) {
                        newErrors.answers = 'The answer must have text';
                    }
                }
            }

            if (question.type === 'TRUE_FALSE' && question.answers.length !== 2) {
                newErrors.answers = 'True/False questions must have exactly 2 answers';
            }

            if (question.type === 'FILL_IN_THE_BLANK' && question.answers.length !== 1) {
                newErrors.answers = 'Fill in the blank must have exactly 1 answer';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const requestData = {
                documentId: String(question.documentId),
                type: question.type,
                text: question.text
            };

            if (question.answers && question.answers.length > 0 && ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_THE_BLANK'].includes(question.type)) {
                const answersData = question.answers.map(answer => {
                    const answerData = {
                        text: answer.text,
                        isCorrect: answer.isCorrect
                    };

                    if (isEdit && answer.id != null && typeof answer.id === 'number') {
                        answerData.id = answer.id;
                    }

                    return answerData;
                });
                requestData.answers = JSON.stringify(answersData);
            }

            console.log('Submitting request data:', requestData);

            let response;
            if (isEdit) {
                response = await QuestionService.updateQuestion(id, requestData);
            } else {
                response = await QuestionService.createQuestion(requestData);
            }

            console.log('Response:', response);
            setSuccess(isEdit ? 'Question updated successfully!' : 'Question created successfully!');

            setTimeout(() => {
                navigate('/questions');
            }, 1500);

        } catch (err) {
            console.error('Error saving question:', err);
            console.error('Error response:', err.response);

            const errorMessage = err.response?.data?.message || err.message || 'Failed to save question. Please try again.';

            if (errorMessage.includes('documentId')) {
                setError('Please make sure to select a document before submitting.');
            } else if (errorMessage.includes('type')) {
                setError('Please make sure the question type is selected properly.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    {isEdit ? 'Edit Question' : 'Create New Question'}
                </h2>
                <button
                    onClick={() => navigate('/questions')}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <FiX size={24} />
                </button>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                    <FiAlertCircle className="mr-2" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg flex items-center">
                    <FiCheckCircle className="mr-2" />
                    <span>{success}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Text
                    </label>
                    <textarea
                        name="text"
                        value={question.text}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.text ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your question..."
                    />
                    {errors.text && <p className="mt-1 text-sm text-red-600">{errors.text}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Type
                    </label>
                    <select
                        name="type"
                        value={question.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {questionTypes.map(type => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Document
                    </label>
                    <select
                        name="documentId"
                        value={question.documentId}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.documentId ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Select a document...</option>
                        {documents.map(doc => (
                            <option key={doc.id} value={doc.id}>
                                {doc.title}
                            </option>
                        ))}
                    </select>
                    {errors.documentId && <p className="mt-1 text-sm text-red-600">{errors.documentId}</p>}
                </div>

                {/* Answers section */}
                {['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_THE_BLANK'].includes(question.type) && (
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                                {question.type === 'FILL_IN_THE_BLANK' ? 'Correct Answer' : 'Answers'}
                            </label>
                            {question.type !== 'FILL_IN_THE_BLANK' && (
                                <button
                                    type="button"
                                    onClick={addAnswer}
                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    <FiPlus className="mr-1" />
                                    Add Answer
                                </button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {question.answers.map((answer, index) => (
                                <div key={index} className="flex items-center space-x-3">
                                    {question.type !== 'FILL_IN_THE_BLANK' && (
                                        <input
                                            type={question.type === 'MULTIPLE_CHOICE' ? 'checkbox' : 'radio'}
                                            name={question.type === 'MULTIPLE_CHOICE' ? `answer-${index}` : 'correct-answer'}
                                            checked={answer.isCorrect}
                                            onChange={(e) => handleAnswerChange(index, 'isCorrect', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                                        />
                                    )}
                                    <input
                                        type="text"
                                        value={answer.text}
                                        onChange={(e) => handleAnswerChange(index, 'text', e.target.value)}
                                        placeholder={question.type === 'FILL_IN_THE_BLANK' ? 'Correct answer' : `Answer ${index + 1}`}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={question.type === 'TRUE_FALSE'} // TRUE_FALSE answers are read-only
                                        readOnly={question.type === 'TRUE_FALSE'}
                                    />
                                    {question.type === 'MULTIPLE_CHOICE' && question.answers.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAnswer(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {errors.answers && <p className="mt-1 text-sm text-red-600">{errors.answers}</p>}
                    </div>
                )}

                <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => navigate('/questions')}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <FiSave className="mr-2" />
                                {isEdit ? 'Update Question' : 'Create Question'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuestionForm;