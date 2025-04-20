package com.finki.uiktp.edugen.service;

import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.dto.GenerateQuestionsRequest;

import java.util.List;

public interface QuestionGenerationService {
    /**
     * Generates questions for a document using AI
     *
     * @param documentId the ID of the document
     * @param request the question generation request parameters
     * @return a list of generated questions
     */
    List<Question> generateQuestions(Long documentId, GenerateQuestionsRequest request);
}