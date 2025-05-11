import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiCheckCircle,
    FiXCircle,
    FiPlay,
    FiRefreshCw,
    FiFileText,
    FiChevronRight,
    FiChevronLeft,
    FiBarChart2,
    FiAlertCircle,
    FiGrid,
    FiTarget,
} from 'react-icons/fi';
import {FaBrain, FaTrophy, FaStar, FaAward} from 'react-icons/fa';
import { useAuth } from '../../components/auth/AuthContext';
import { QuestionService } from '../../services';

const QUIZ_STATES = {
    SETUP: 'setup',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    REVIEWING: 'reviewing'
};

const QuizPage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    const [quizState, setQuizState] = useState(QUIZ_STATES.SETUP);
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [completionTime, setCompletionTime] = useState(null);
    const [showQuestionGrid, setShowQuestionGrid] = useState(false);

    const [filters, setFilters] = useState({
        type: '',
        document: '',
        searchQuery: ''
    });

    const [quizSettings, setQuizSettings] = useState({
        questionCount: 10,
        shuffleQuestions: true,
        shuffleAnswers: true,
        showFeedback: true,
        allowReview: true,
        timeLimit: 0
    });

    const [timeLeft, setTimeLeft] = useState(quizSettings.timeLimit);
    const [timerId, setTimerId] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/quiz' } });
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await QuestionService.getAll();
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
    }, [isAuthenticated]);

    useEffect(() => {
        let result = [...questions];

        if (filters.searchQuery) {
            result = result.filter(question =>
                question.text.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
                (question.documentTitle && question.documentTitle.toLowerCase().includes(filters.searchQuery.toLowerCase()))
            );
        }

        if (filters.type) {
            result = result.filter(question => question.type === filters.type);
        }

        if (filters.document) {
            result = result.filter(question =>
                question.documentTitle && question.documentTitle.toLowerCase().includes(filters.document.toLowerCase())
            );
        }

        setFilteredQuestions(result);
    }, [questions, filters]);

    useEffect(() => {
        if (quizState === QUIZ_STATES.IN_PROGRESS && quizSettings.timeLimit > 0) {
            if (timeLeft > 0) {
                const timer = setTimeout(() => {
                    setTimeLeft(timeLeft - 1);
                }, 1000);
                setTimerId(timer);
                return () => clearTimeout(timer);
            } else {
                handleTimeUp();
            }
        }
        return () => {
            if (timerId) clearTimeout(timerId);
        };
    }, [timeLeft, quizState, quizSettings.timeLimit]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getQuestionTypeName = (type) => {
        switch (type) {
            case 'MULTIPLE_CHOICE': return 'Multiple Choice';
            case 'TRUE_FALSE': return 'True/False';
            case 'FILL_IN_THE_BLANK': return 'Fill in the Blank';
            default: return type;
        }
    };

    const getUniqueDocuments = () => {
        return Array.from(new Set(
            questions
                .filter(q => q.documentTitle)
                .map(q => q.documentTitle)
        ));
    };

    const getUniqueTypes = () => {
        return Array.from(new Set(
            questions
                .filter(q => q.type)
                .map(q => q.type)
        ));
    };

    const handleFilterChange = (type, value) => {
        setFilters({
            ...filters,
            [type]: value
        });
    };

    const handleQuizSettingsChange = (setting, value) => {
        setQuizSettings({
            ...quizSettings,
            [setting]: value
        });
    };

    const startQuiz = () => {
        if (filteredQuestions.length === 0) {
            setError('No questions available for the selected criteria. Please adjust your filters.');
            return;
        }

        let quizQuestions = [...filteredQuestions];

        if (quizSettings.shuffleQuestions) {
            quizQuestions = quizQuestions.sort(() => Math.random() - 0.5);
        }

        quizQuestions = quizQuestions.slice(0, Math.min(quizSettings.questionCount, quizQuestions.length));

        if (quizSettings.shuffleAnswers) {
            quizQuestions = quizQuestions.map(question => ({
                ...question,
                answers: question.answers ? [...question.answers].sort(() => Math.random() - 0.5) : []
            }));
        }

        setSelectedQuestions(quizQuestions);
        setCurrentQuestionIndex(0);
        setUserAnswers({});
        setScore(null);
        setQuizState(QUIZ_STATES.IN_PROGRESS);
        setStartTime(Date.now());
        setTimeLeft(quizSettings.timeLimit || 0);
    };

    const handleAnswerSelect = (questionId, answerId, isMultipleChoice = false) => {
        if (quizState !== QUIZ_STATES.IN_PROGRESS) return;

        if (isMultipleChoice) {
            const currentAnswers = userAnswers[questionId] || [];
            const newAnswers = currentAnswers.includes(answerId)
                ? currentAnswers.filter(id => id !== answerId)
                : [...currentAnswers, answerId];

            setUserAnswers({
                ...userAnswers,
                [questionId]: newAnswers
            });
        } else {
            setUserAnswers({
                ...userAnswers,
                [questionId]: answerId
            });
        }
    };

    const handleFillInBlank = (questionId, value) => {
        if (quizState !== QUIZ_STATES.IN_PROGRESS) return;

        setUserAnswers({
            ...userAnswers,
            [questionId]: value
        });
    };

    const navigateToQuestion = (index) => {
        if (index >= 0 && index < selectedQuestions.length) {
            setCurrentQuestionIndex(index);
            setShowAnswer(false);
            setShowQuestionGrid(false);
        }
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < selectedQuestions.length - 1) {
            navigateToQuestion(currentQuestionIndex + 1);
        } else {
            handleQuizComplete();
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            navigateToQuestion(currentQuestionIndex - 1);
        }
    };

    const calculateScore = () => {
        let correctAnswers = 0;

        selectedQuestions.forEach(question => {
            const userAnswer = userAnswers[question.id];

            if (question.type === 'MULTIPLE_CHOICE') {
                const correctAnswerIds = question.answers
                    .filter(answer => answer.isCorrect)
                    .map(answer => answer.id);

                const userSelectedIds = Array.isArray(userAnswer) ? userAnswer : [];

                const isCorrect = correctAnswerIds.length === userSelectedIds.length &&
                    correctAnswerIds.every(id => userSelectedIds.includes(id)) &&
                    userSelectedIds.every(id => correctAnswerIds.includes(id));

                if (isCorrect) {
                    correctAnswers++;
                }
            } else if (question.type === 'TRUE_FALSE') {
                const correctAnswer = question.answers.find(answer => answer.isCorrect);
                if (correctAnswer && correctAnswer.id === userAnswer) {
                    correctAnswers++;
                }
            } else if (question.type === 'FILL_IN_THE_BLANK') {
                const correctAnswer = question.answers.find(answer => answer.isCorrect);
                if (correctAnswer && correctAnswer.text.toLowerCase().trim() === userAnswer?.toLowerCase().trim()) {
                    correctAnswers++;
                }
            }
        });

        return {
            correct: correctAnswers,
            total: selectedQuestions.length,
            percentage: Math.round((correctAnswers / selectedQuestions.length) * 100)
        };
    };

    const handleQuizComplete = () => {
        const quizScore = calculateScore();
        setScore(quizScore);
        setCompletionTime(Math.round((Date.now() - startTime) / 1000));
        setQuizState(QUIZ_STATES.COMPLETED);

        if (timerId) {
            clearTimeout(timerId);
        }
    };

    const handleTimeUp = () => {
        alert('Time is up! Your quiz will be submitted automatically.');
        handleQuizComplete();
    };

    const handleReviewQuiz = () => {
        setQuizState(QUIZ_STATES.REVIEWING);
        setCurrentQuestionIndex(0);
        setShowAnswer(false);
    };

    const handleRetakeQuiz = () => {
        setQuizState(QUIZ_STATES.SETUP);
        setSelectedQuestions([]);
        setUserAnswers({});
        setScore(null);
        setCurrentQuestionIndex(0);
        setCompletionTime(null);
        setShowAnswer(false);
    };

    const answeredQuestions = Object.keys(userAnswers).length;
    const progressPercentage = Math.round((answeredQuestions / selectedQuestions.length) * 100);

    const totalTimeInSeconds = quizSettings.timeLimit;
    const timeElapsed = totalTimeInSeconds - timeLeft;
    const timerPercentage = totalTimeInSeconds > 0 ? ((timeElapsed / totalTimeInSeconds) * 100) : 0;

    const CircularTimer = () => (
        <div className="relative w-16 h-16">
            <svg className="transform -rotate-90 w-16 h-16">
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="text-gray-200"
                />
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 28}`}
                    strokeDashoffset={`${2 * Math.PI * 28 * (1 - timerPercentage / 100)}`}
                    className={`transition-all duration-1000 ${
                        timeLeft < 60 ? 'text-red-500' :
                            timeLeft < 300 ? 'text-yellow-500' : 'text-blue-500'
                    }`}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-medium">{formatTime(timeLeft)}</span>
            </div>
        </div>
    );

    const QuestionGrid = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Question Overview</h3>
                    <button
                        onClick={() => setShowQuestionGrid(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FiXCircle className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-4 grid grid-cols-5 gap-3 max-h-96 overflow-y-auto">
                    {selectedQuestions.map((question, index) => {
                        const isAnswered = userAnswers[question.id] !== undefined;
                        const isCurrent = index === currentQuestionIndex;

                        return (
                            <button
                                key={question.id}
                                onClick={() => navigateToQuestion(index)}
                                className={`w-full aspect-square rounded-md border-2 flex items-center justify-center font-medium transition-colors ${
                                    isCurrent
                                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                                        : isAnswered
                                            ? 'border-green-500 bg-green-100 text-green-700'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                                }`}
                            >
                                {index + 1}
                            </button>
                        );
                    })}
                </div>
                <div className="p-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-green-500 bg-green-100 rounded"></div>
                            <span>Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-300 bg-white rounded"></div>
                            <span>Unanswered</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-blue-500 bg-blue-100 rounded"></div>
                            <span>Current</span>
                        </div>
                    </div>
                    <span>{answeredQuestions}/{selectedQuestions.length} completed</span>
                </div>
            </div>
        </div>
    );

    const renderQuizSetup = () => (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                    <FaBrain className="h-8 w-8 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-semibold text-gray-800">Create a Quiz</h2>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex items-center">
                        <FiAlertCircle className="mr-2" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Question filters */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Select Questions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={filters.searchQuery}
                                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                            <select
                                value={filters.type}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                {getUniqueTypes().map(type => (
                                    <option key={type} value={type}>{getQuestionTypeName(type)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
                            <select
                                value={filters.document}
                                onChange={(e) => handleFilterChange('document', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Documents</option>
                                {getUniqueDocuments().map(doc => (
                                    <option key={doc} value={doc}>{doc}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="text-sm text-gray-600">
                        {filteredQuestions.length} questions available
                    </div>
                </div>

                {/* Quiz settings */}
                <div className="mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Number of Questions
                            </label>
                            <input
                                type="number"
                                min="1"
                                max={filteredQuestions.length}
                                value={quizSettings.questionCount}
                                onChange={(e) => handleQuizSettingsChange('questionCount', parseInt(e.target.value) || 1)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Time Limit (minutes, 0 for unlimited)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={quizSettings.timeLimit / 60}
                                onChange={(e) => handleQuizSettingsChange('timeLimit', (parseInt(e.target.value) || 0) * 60)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={quizSettings.shuffleQuestions}
                                onChange={(e) => handleQuizSettingsChange('shuffleQuestions', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Shuffle questions</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={quizSettings.shuffleAnswers}
                                onChange={(e) => handleQuizSettingsChange('shuffleAnswers', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Shuffle answer options</span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={quizSettings.allowReview}
                                onChange={(e) => handleQuizSettingsChange('allowReview', e.target.checked)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Allow review after completion</span>
                        </label>
                    </div>
                </div>

                {/* Start quiz button */}
                <div className="text-center">
                    <button
                        onClick={startQuiz}
                        disabled={filteredQuestions.length === 0}
                        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        <FiPlay className="inline mr-2" />
                        Start Quiz
                    </button>
                </div>
            </div>
        </div>
    );

    const renderQuestion = () => {
        const question = selectedQuestions[currentQuestionIndex];
        if (!question) return null;

        const userAnswer = userAnswers[question.id];
        const isReviewing = quizState === QUIZ_STATES.REVIEWING;

        return (
            <div className="max-w-4xl mx-auto">
                {/* Show question grid modal */}
                {showQuestionGrid && <QuestionGrid />}

                <div className="bg-white rounded-lg shadow-md p-6">
                    {/* Quiz header with new progress indicators */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">
                                Question {currentQuestionIndex + 1} of {selectedQuestions.length}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Type: {getQuestionTypeName(question.type)}
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Question Grid Button */}
                            <button
                                onClick={() => setShowQuestionGrid(true)}
                                className="flex items-center gap-2 px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                <FiGrid className="h-4 w-4" />
                                <span className="text-sm">{answeredQuestions}/{selectedQuestions.length}</span>
                            </button>

                            {/* Progress Bar */}
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                ></div>
                            </div>

                            {/* Circular Timer */}
                            {quizSettings.timeLimit > 0 && quizState === QUIZ_STATES.IN_PROGRESS && (
                                <CircularTimer />
                            )}

                            <span className="text-sm text-gray-600">
                                Document: {question.documentTitle || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Question text */}
                    <div className="mb-6">
                        <p className="text-lg text-gray-900">{question.text}</p>
                    </div>

                    {/* Answer options */}
                    <div className="space-y-3">
                        {question.type === 'MULTIPLE_CHOICE' ? (
                            <div>
                                <p className="text-sm text-gray-600 mb-3">Select all correct answers:</p>
                                {question.answers.map(answer => {
                                    const userSelectedIds = Array.isArray(userAnswer) ? userAnswer : [];
                                    const isSelected = userSelectedIds.includes(answer.id);
                                    const isCorrect = answer.isCorrect;
                                    const showCorrect = isReviewing && isCorrect;
                                    const showIncorrect = isReviewing && isSelected && !isCorrect;
                                    const showMissed = isReviewing && !isSelected && isCorrect;

                                    return (
                                        <label
                                            key={answer.id}
                                            className={`block p-3 border rounded-md cursor-pointer transition-colors ${
                                                showCorrect ? 'border-green-500 bg-green-50' :
                                                    showIncorrect ? 'border-red-500 bg-red-50' :
                                                        showMissed ? 'border-orange-500 bg-orange-50' :
                                                            isSelected ? 'border-blue-500 bg-blue-50' :
                                                                'border-gray-300 hover:border-gray-400'
                                            }`}
                                            onClick={() => handleAnswerSelect(question.id, answer.id, true)}
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerSelect(question.id, answer.id, true)}
                                                    disabled={isReviewing}
                                                    className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                                                />
                                                <span className={`ml-3 ${isCorrect && isReviewing ? 'font-medium' : ''}`}>
                                                    {answer.text}
                                                </span>
                                                {isReviewing && (
                                                    <span className="ml-auto">
                                                        {isCorrect && <FiCheckCircle className="text-green-600" />}
                                                        {showIncorrect && <FiXCircle className="text-red-600" />}
                                                    </span>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : question.type === 'TRUE_FALSE' ? (
                            question.answers.map(answer => {
                                const isSelected = userAnswer === answer.id;
                                const isCorrect = answer.isCorrect;
                                const showCorrect = isReviewing && isCorrect;
                                const showIncorrect = isReviewing && isSelected && !isCorrect;

                                return (
                                    <label
                                        key={answer.id}
                                        className={`block p-3 border rounded-md cursor-pointer transition-colors ${
                                            showCorrect ? 'border-green-500 bg-green-50' :
                                                showIncorrect ? 'border-red-500 bg-red-50' :
                                                    isSelected ? 'border-blue-500 bg-blue-50' :
                                                        'border-gray-300 hover:border-gray-400'
                                        }`}
                                        onClick={() => handleAnswerSelect(question.id, answer.id)}
                                    >
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name={`question-${question.id}`}
                                                checked={isSelected}
                                                onChange={() => handleAnswerSelect(question.id, answer.id)}
                                                disabled={isReviewing}
                                                className="text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className={`ml-3 ${isCorrect && isReviewing ? 'font-medium' : ''}`}>
                                                {answer.text}
                                            </span>
                                            {isReviewing && (
                                                <span className="ml-auto">
                                                    {isCorrect && <FiCheckCircle className="text-green-600" />}
                                                    {showIncorrect && <FiXCircle className="text-red-600" />}
                                                </span>
                                            )}
                                        </div>
                                    </label>
                                );
                            })
                        ) : question.type === 'FILL_IN_THE_BLANK' ? (
                            <div>
                                <input
                                    type="text"
                                    value={userAnswer || ''}
                                    onChange={(e) => handleFillInBlank(question.id, e.target.value)}
                                    disabled={isReviewing}
                                    placeholder="Type your answer here..."
                                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                                        isReviewing ? 'bg-gray-50' : 'focus:ring-blue-500'
                                    }`}
                                />
                                {isReviewing && (
                                    <div className="mt-2">
                                        {question.answers.find(a => a.isCorrect)?.text.toLowerCase().trim() === userAnswer?.toLowerCase().trim() ? (
                                            <p className="text-green-600 flex items-center">
                                                <FiCheckCircle className="mr-1" />
                                                Correct!
                                            </p>
                                        ) : (
                                            <p className="text-red-600 flex items-center">
                                                <FiXCircle className="mr-1" />
                                                Correct answer: {question.answers.find(a => a.isCorrect)?.text}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between mt-8">
                        <button
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestionIndex === 0}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            <FiChevronLeft className="mr-1" />
                            Previous
                        </button>

                        <button
                            onClick={handleNextQuestion}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                            {currentQuestionIndex === selectedQuestions.length - 1 ? 'Finish Quiz' : 'Next'}
                            <FiChevronRight className="ml-1" />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderQuizResults = () => {
        const getBadge = (percentage) => {
            if (percentage >= 90) return { color: 'bg-yellow-500', icon: FaTrophy, text: 'Outstanding!' };
            if (percentage >= 80) return { color: 'bg-blue-500', icon: FaAward, text: 'Excellent!' };
            if (percentage >= 70) return { color: 'bg-green-500', icon: FiTarget, text: 'Good Job!' };
            if (percentage >= 60) return { color: 'bg-orange-500', icon: FaStar, text: 'Not Bad!' };
            return { color: 'bg-red-500', icon: FiTarget, text: 'Keep Trying!' };
        };

        const badge = getBadge(score.percentage);
        const BadgeIcon = badge.icon;

        return (
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    {/* Header with gradient background */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white text-center">
                        <div className={`inline-flex items-center justify-center w-20 h-20 ${badge.color} rounded-full mb-4`}>
                            <BadgeIcon className="h-10 w-10 text-white" />
                        </div>
                        <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
                        <p className="text-xl text-blue-100">{badge.text}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
                        <div className="text-center">
                            <div className="relative inline-block">
                                <svg className="transform -rotate-90 w-32 h-32">
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        className="text-gray-200"
                                    />
                                    <circle
                                        cx="64"
                                        cy="64"
                                        r="56"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 56}`}
                                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - score.percentage / 100)}`}
                                        className={`transition-all duration-1000 ${
                                            score.percentage >= 80 ? 'text-green-500' :
                                                score.percentage >= 70 ? 'text-blue-500' :
                                                    score.percentage >= 60 ? 'text-yellow-500' : 'text-red-500'
                                        }`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <span className="text-4xl font-bold text-gray-800">{score.percentage}%</span>
                                        <p className="text-sm text-gray-600">Score</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="w-32 h-32 mx-auto flex items-center justify-center bg-blue-100 rounded-full">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-blue-600">
                                        {score.correct}/{score.total}
                                    </p>
                                    <p className="text-sm text-blue-700">Correct Answers</p>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="w-32 h-32 mx-auto flex items-center justify-center bg-purple-100 rounded-full">
                                <div className="text-center">
                                    <p className="text-4xl font-bold text-purple-600">{formatTime(completionTime)}</p>
                                    <p className="text-sm text-purple-700">Time Taken</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="border-t border-gray-200 p-8 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-sm text-gray-600">Total Questions</p>
                                <p className="text-lg font-semibold text-gray-800">{score.total}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Correct</p>
                                <p className="text-lg font-semibold text-green-600">{score.correct}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Incorrect</p>
                                <p className="text-lg font-semibold text-red-600">{score.total - score.correct}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Time Limit</p>
                                <p className="text-lg font-semibold text-gray-800">
                                    {quizSettings.timeLimit ? formatTime(quizSettings.timeLimit) : 'Unlimited'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-8 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleRetakeQuiz}
                                className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
                            >
                                <FiRefreshCw className="mr-2" />
                                Retake Quiz
                            </button>

                            {quizSettings.allowReview && (
                                <button
                                    onClick={handleReviewQuiz}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center"
                                >
                                    <FiBarChart2 className="mr-2" />
                                    Review Answers
                                </button>
                            )}

                            <button
                                onClick={() => window.location.replace('/quiz')}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center"
                            >
                                <FiFileText className="mr-2"/>
                                Back to Quiz Maker
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!isAuthenticated) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {quizState === QUIZ_STATES.SETUP && renderQuizSetup()}
            {(quizState === QUIZ_STATES.IN_PROGRESS || quizState === QUIZ_STATES.REVIEWING) && renderQuestion()}
            {quizState === QUIZ_STATES.COMPLETED && renderQuizResults()}
        </div>
    );
};

export default QuizPage;