package com.finki.uiktp.edugen.service;

import com.finki.uiktp.edugen.model.Answer;
import com.finki.uiktp.edugen.model.Question;

import java.io.InputStream;
import java.util.List;

public interface TextAnalysis {

    String cleanText(String text);

    List<Question> generateQuestions(String text);

    List<Answer> generateAnswers(String text, List<Question> questions);

    String extractTextFromDocument(Object document);

}
