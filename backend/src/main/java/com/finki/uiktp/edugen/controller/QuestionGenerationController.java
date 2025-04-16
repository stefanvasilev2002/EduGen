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

        // Convert to DTOs for the response
        List<QuestionDto> questionDtos = generatedQuestions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(questionDtos);
    }

    private QuestionDto convertToDto(Question question) {
        // This method would map the Question entity to a QuestionDto
        // Implement according to your DTO structure
        QuestionDto dto = new QuestionDto();
        dto.setId(question.getId());
        dto.setText(question.getText());
        dto.setType(question.getType().toString());
        dto.setDocumentId(question.getDocument().getId());
        dto.setDocumentTitle(question.getDocument().getTitle());

        // Map answers
        // Implement according to your Answer DTO structure

        return dto;
    }
}