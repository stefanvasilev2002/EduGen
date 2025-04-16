package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.dto.QuestionDto;
import com.finki.uiktp.edugen.model.enums.QuestionType;
import com.finki.uiktp.edugen.service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public ResponseEntity<List<QuestionDto>> getAllQuestions() {
        List<Question> questions = questionService.listAll();
        List<QuestionDto> questionDtos = questions.stream()
                .map(QuestionDto::fromQuestion)
                .collect(Collectors.toList());
        return ResponseEntity.ok(questionDtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuestionDto> getQuestionById(@PathVariable Long id) {
        return questionService.findById(id)
                .map(QuestionDto::fromQuestion)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<QuestionDto> createQuestion(
            @RequestParam Long documentId,
            @RequestParam QuestionType type,
            @RequestParam String text) {

        Question question = questionService.create(documentId, type, text);
        return ResponseEntity.ok(QuestionDto.fromQuestion(question));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuestionDto> updateQuestion(
            @PathVariable Long id,
            @RequestParam QuestionType type,
            @RequestParam String text) {

        return questionService.update(id, type, text)
                .map(QuestionDto::fromQuestion)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<QuestionDto> deleteQuestion(@PathVariable Long id) {
        Question question = questionService.delete(id);
        return ResponseEntity.ok(QuestionDto.fromQuestion(question));
    }

    @GetMapping("/document/{documentId}")
    public ResponseEntity<List<QuestionDto>> getQuestionsByDocumentId(@PathVariable Long documentId) {
        List<Question> questions = questionService.findByDocumentId(documentId);
        List<QuestionDto> questionDtos = questions.stream()
                .map(QuestionDto::fromQuestion)
                .collect(Collectors.toList());
        return ResponseEntity.ok(questionDtos);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<QuestionDto>> getQuestionsByType(@PathVariable QuestionType type) {
        List<Question> questions = questionService.findByType(type);
        List<QuestionDto> questionDtos = questions.stream()
                .map(QuestionDto::fromQuestion)
                .collect(Collectors.toList());
        return ResponseEntity.ok(questionDtos);
    }

    // Method for handling answers will be added in a separate controller
}