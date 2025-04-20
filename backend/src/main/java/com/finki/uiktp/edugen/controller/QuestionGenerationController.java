package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.dto.GenerateQuestionsRequest;
import com.finki.uiktp.edugen.model.dto.QuestionDto;
import com.finki.uiktp.edugen.service.QuestionGenerationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionGenerationController {

    private final QuestionGenerationService questionGenerationService;

    public QuestionGenerationController(QuestionGenerationService questionGenerationService) {
        this.questionGenerationService = questionGenerationService;
    }

    @PostMapping("/generate")
    public ResponseEntity<List<QuestionDto>> generateQuestions(
            @RequestParam Long documentId,
            @RequestBody GenerateQuestionsRequest request) {

        List<Question> generatedQuestions = questionGenerationService.generateQuestions(documentId, request);

        List<QuestionDto> questionDtos = generatedQuestions.stream()
                .map(QuestionDto::fromQuestion)
                .collect(Collectors.toList());

        return ResponseEntity.ok(questionDtos);
    }
}