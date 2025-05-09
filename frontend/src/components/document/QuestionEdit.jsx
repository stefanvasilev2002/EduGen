import React, { useState, useEffect } from 'react';
import QuestionService from './services/QuestionService';

const QuestionEdit = ({ documentId, existingQuestion, onSave }) => {
    const [questionText, setQuestionText] = useState('');
    const [questionType, setQuestionType] = useState('MULTIPLE_CHOICE');
    const [answers, setAnswers] = useState([{ text: '' }]);

    useEffect(() => {
        if (existingQuestion) {
            setQuestionText(existingQuestion.text);
            setQuestionType(existingQuestion.type);
            setAnswers(
                existingQuestion.answers?.map(a => ({ id: a.id, text: a.text })) || [{ text: '' }]
            );
        }
    }, [existingQuestion]);

    const handleSave = async () => {
        const questionData = { type: questionType, text: questionText };

        try {
            let savedQuestion;
            if (existingQuestion) {
                savedQuestion = await QuestionService.updateQuestion(existingQuestion.id, questionData);
            } else {
                savedQuestion = await QuestionService.createQuestion({
                    documentId,
                    type: questionType,
                    text: questionText
                });
            }

            for (const answer of answers) {
                if (answer.text.trim() === '') continue;

                if (answer.id) {
                    await QuestionService.updateAnswer(savedQuestion.id, answer.id, { text: answer.text });
                } else {
                    await QuestionService.addAnswer(savedQuestion.id, { text: answer.text });
                }
            }

            onSave(savedQuestion);
        } catch (error) {
            console.error('Error saving question or answers:', error);
        }
    };

    const addAnswer = () => {
        setAnswers([...answers, { text: '' }]);
    };

    const handleAnswerChange = (index, value) => {
        const updatedAnswers = [...answers];
        updatedAnswers[index].text = value;
        setAnswers(updatedAnswers);
    };

    return (
        <div>
            <h3>{existingQuestion ? 'Edit' : 'Add'} Question</h3>
            <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter the question"
            />
            <div>
                <h4>Answers</h4>
                {answers.map((answer, index) => (
                    <input
                        key={index}
                        type="text"
                        value={answer.text}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder={`Answer ${index + 1}`}
                    />
                ))}
                <button onClick={addAnswer}>Add Answer</button>
            </div>
            <button onClick={handleSave}>Save Question</button>
        </div>
    );
};

export default QuestionEdit;
