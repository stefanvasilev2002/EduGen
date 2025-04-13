package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.Answer;
import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.service.TextAnalysis;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/text-analysis")
public class TextAnalysisController {

    private final TextAnalysis textAnalysis;

    @Autowired
    public TextAnalysisController(TextAnalysis textAnalysis) {
        this.textAnalysis = textAnalysis;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeDocument(@RequestParam("file") MultipartFile file) {
        try {
            InputStream inputStream = file.getInputStream();

            String extractedText = textAnalysis.extractTextFromDocument(inputStream);
            String cleanedText = textAnalysis.cleanText(extractedText);

            List<Question> questions = textAnalysis.generateQuestions(cleanedText);
            List<Answer> answers = textAnalysis.generateAnswers(cleanedText, questions);

            Map<String, Object> response = new HashMap<>();
            response.put("questions", questions);
            response.put("answers", answers);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to analyze document: " + e.getMessage());
        }
    }
}
