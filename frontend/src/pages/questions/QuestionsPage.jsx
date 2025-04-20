import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    FiList,
    FiFileText,
    FiEdit,
    FiTrash2,
    FiPlus,
    FiFilter,
    FiAlertCircle,
    FiCheckCircle,
    FiSearch,
    FiEye,
    FiChevronDown,
    FiChevronUp
} from 'react-icons/fi';
import { useAuth } from '../../components/auth/AuthContext';
import { QuestionService } from '../../services';

const QuestionsPage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        document: ''
    });
    const [sortConfig, setSortConfig] = useState({
        key: 'id',
        direction: 'desc'
    });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState(null);
    const [expandedQuestion, setExpandedQuestion] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/questions' } });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await QuestionService.getAll();
                console.log(response.data)
                setQuestions(response.data || []);
                setFilteredQuestions(response.data || []);
                setIsLoading(false);
            } catch (err) {
                console.error('Error fetching questions:', err);
                setError('Failed to load questions. Please try again.');
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchQuestions();
        }
    }, [isAuthenticated, user]);

    useEffect(() => {
        let result = [...questions];

        // Apply search filter
        if (searchQuery) {
            result = result.filter(question =>
                question.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                question.documentTitle?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply type filter
        if (filters.type) {
            result = result.filter(question => question.type === filters.type);
        }

        // Apply document filter
        if (filters.document) {
            result = result.filter(question =>
                question.documentTitle?.toLowerCase().includes(filters.document.toLowerCase())
            );
        }

        // Apply sorting
        if (sortConfig.key) {
            result.sort((a, b) => {
                if (!a[sortConfig.key] && !b[sortConfig.key]) return 0;
                if (!a[sortConfig.key]) return 1;
                if (!b[sortConfig.key]) return -1;

                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredQuestions(result);
    }, [questions, searchQuery, filters, sortConfig]);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleFilterChange = (type, value) => {
        setFilters({
            ...filters,
            [type]: value
        });
    };

    const clearFilters = () => {
        setSearchQuery('');
        setFilters({
            type: '',
            document: ''
        });
    };

    const handleDeleteClick = (question) => {
        setQuestionToDelete(question);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (questionToDelete) {
            try {
                await QuestionService.deleteQuestion(questionToDelete.id);
                setQuestions(questions.filter(q => q.id !== questionToDelete.id));
                setShowDeleteModal(false);
                setQuestionToDelete(null);
                setSuccess('Question deleted successfully');

                setTimeout(() => {
                    setSuccess(null);
                }, 3000);
            } catch (err) {
                console.error('Error deleting question:', err);
                setError('Failed to delete question. Please try again.');
            }
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setQuestionToDelete(null);
    };

    const toggleQuestionExpand = (questionId) => {
        if (expandedQuestion === questionId) {
            setExpandedQuestion(null);
        } else {
            setExpandedQuestion(questionId);
        }
    };

    const getQuestionTypeName = (type) => {
        switch (type) {
            case 'MULTIPLE_CHOICE': return 'Multiple Choice';
            case 'TRUE_FALSE': return 'True/False';
            case 'FILL_IN_THE_BLANK': return 'Fill in the Blank';
            case 'SHORT_ANSWER': return 'Short Answer';
            case 'MATCHING': return 'Matching';
            case 'ORDERING': return 'Ordering';
            case 'ESSAY': return 'Essay';
            default: return type;
        }
    };

    const getQuestionTypeClasses = (type) => {
        switch (type) {
            case 'MULTIPLE_CHOICE': return 'bg-blue-100 text-blue-800';
            case 'TRUE_FALSE': return 'bg-green-100 text-green-800';
            case 'FILL_IN_THE_BLANK': return 'bg-yellow-100 text-yellow-800';
            case 'SHORT_ANSWER': return 'bg-purple-100 text-purple-800';
            case 'MATCHING': return 'bg-indigo-100 text-indigo-800';
            case 'ORDERING': return 'bg-pink-100 text-pink-800';
            case 'ESSAY': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // Get unique document titles and types for filters
    const uniqueDocuments = Array.from(new Set(
        questions
            .filter(q => q.documentTitle)
            .map(q => q.documentTitle)
    ));

    const uniqueTypes = Array.from(new Set(
        questions
            .filter(q => q.type)
            .map(q => q.type)
    ));

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Questions</h2>
                <Link
                    to="/questions/generate"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                    <FiPlus className="mr-2" />
                    Generate Questions
                </Link>
            </div>

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

            {/* Search and filters */}
            <div className="mb-6 flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex flex-row gap-2">
                    <div className="relative">
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">All Question Types</option>
                            {uniqueTypes.map(type => (
                                <option key={type} value={type}>{getQuestionTypeName(type)}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <FiChevronDown className="text-gray-400" />
                        </div>
                    </div>

                    <div className="relative">
                        <select
                            value={filters.document}
                            onChange={(e) => handleFilterChange('document', e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        >
                            <option value="">All Documents</option>
                            {uniqueDocuments.map(doc => (
                                <option key={doc} value={doc}>{doc}</option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <FiChevronDown className="text-gray-400" />
                        </div>
                    </div>

                    <button
                        onClick={clearFilters}
                        className="px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                        title="Clear filters"
                    >
                        <FiFilter />
                    </button>
                </div>
            </div>

            {/* Loading indicator */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <>
                    {/* Questions table or list */}
                    {filteredQuestions.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th
                                        onClick={() => handleSort('text')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    >
                                        <span className="flex items-center">
                                            Question
                                            {sortConfig.key === 'text' && (
                                                sortConfig.direction === 'asc'
                                                    ? <FiChevronUp className="ml-1" />
                                                    : <FiChevronDown className="ml-1" />
                                            )}
                                        </span>
                                    </th>
                                    <th
                                        onClick={() => handleSort('type')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    >
                                        <span className="flex items-center">
                                            Type
                                            {sortConfig.key === 'type' && (
                                                sortConfig.direction === 'asc'
                                                    ? <FiChevronUp className="ml-1" />
                                                    : <FiChevronDown className="ml-1" />
                                            )}
                                        </span>
                                    </th>
                                    <th
                                        onClick={() => handleSort('documentTitle')}
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                    >
                                        <span className="flex items-center">
                                            Document
                                            {sortConfig.key === 'documentTitle' && (
                                                sortConfig.direction === 'asc'
                                                    ? <FiChevronUp className="ml-1" />
                                                    : <FiChevronDown className="ml-1" />
                                            )}
                                        </span>
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {filteredQuestions.map((question) => (
                                    <React.Fragment key={question.id}>
                                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleQuestionExpand(question.id)}>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">{question.text}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getQuestionTypeClasses(question.type)}`}>
                                                    {getQuestionTypeName(question.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <FiFileText className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                                                    <div className="text-sm text-gray-500">{question.documentTitle}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            toggleQuestionExpand(question.id);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            // Redirect to edit question page
                                                            // navigate(`/questions/edit/${question.id}`);
                                                        }}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                        title="Edit Question"
                                                    >
                                                        <FiEdit />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteClick(question);
                                                        }}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete Question"
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {expandedQuestion === question.id && (
                                            <tr className="bg-gray-50">
                                                <td colSpan="4" className="px-6 py-4">
                                                    <div className="border-l-4 border-blue-500 pl-4">
                                                        <h4 className="text-lg font-medium text-gray-900 mb-2">Answers:</h4>
                                                        <div className="space-y-2">
                                                            {question.answers && question.answers.map((answer) => (
                                                                <div key={answer.id} className="flex items-start">
                                                                    <div className={`mt-1 h-4 w-4 rounded-full ${answer.correct ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                                                                    <div className={`text-sm ${answer.correct ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                                                        {answer.text}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg">
                            <FiList className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No questions found</h3>
                            <p className="text-gray-500 mb-4">
                                {searchQuery || filters.type || filters.document
                                    ? 'Try clearing your filters or generate new questions'
                                    : 'Get started by generating your first questions'}
                            </p>
                            <Link
                                to="/questions/generate"
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                <FiPlus className="mr-2 -ml-1 h-4 w-4" />
                                Generate Questions
                            </Link>
                        </div>
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
                        </div>
                        <div className="p-4">
                            <p className="mb-4">
                                Are you sure you want to delete this question? This action cannot be undone.
                            </p>
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={cancelDelete}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionsPage;