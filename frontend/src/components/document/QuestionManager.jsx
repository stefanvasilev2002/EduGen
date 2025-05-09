import React, { useEffect, useState } from 'react';
import QuestionService from './services/QuestionService';
import QuestionEdit from './QuestionEdit';

const QuestionManager = ({ documentId }) => {
    const [questions, setQuestions] = useState([]);
    const [editingQuestion, setEditingQuestion] = useState(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await QuestionService.getByDocumentId(documentId);
                setQuestions(response);
            } catch (error) {
                console.error('Error fetching questions:', error);
            }
        };

        fetchQuestions();
    }, [documentId]);

    const handleEdit = (question) => {
        setEditingQuestion(question);
    };

    const handleSave = (savedQuestion) => {
        setQuestions((prevQuestions) => {
            const exists = prevQuestions.some(q => q.id === savedQuestion.id);
            if (exists) {
                return prevQuestions.map(q => q.id === savedQuestion.id ? savedQuestion : q);
            } else {
                return [...prevQuestions, savedQuestion];
            }
        });
        setEditingQuestion(null);
    };

    return (
        <div>
            <h2>Questions</h2>
            {editingQuestion ? (
                <QuestionEdit
                    existingQuestion={editingQuestion}
                    documentId={documentId}
                    onSave={handleSave}
                />
            ) : (
                <div>
                    <button onClick={() => setEditingQuestion({})}>Add Question</button>
                    <ul>
                        {questions.map((question) => (
                            <li key={question.id}>
                                <span>{question.text}</span>
                                <button onClick={() => handleEdit(question)}>Edit</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default QuestionManager;
