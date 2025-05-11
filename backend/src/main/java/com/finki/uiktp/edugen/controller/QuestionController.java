package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.Answer;
import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.dto.QuestionDto;
import com.finki.uiktp.edugen.model.enums.QuestionType;
import com.finki.uiktp.edugen.service.QuestionService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/questions")
@CrossOrigin(origins = "*")
public class QuestionController {

    private final QuestionService questionService;
    private final ObjectMapper objectMapper;

    public QuestionController(QuestionService questionService, ObjectMapper objectMapper) {
        this.questionService = questionService;
        this.objectMapper = objectMapper;
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
    public ResponseEntity<?> createQuestion(
            @RequestParam("documentId") Long documentId,
            @RequestParam("type") QuestionType type,
            @RequestParam("text") String text,
            @RequestParam(value = "answers", required = false) String answers) {

        try {
            System.out.println("Creating question:");
            System.out.println("DocumentId: " + documentId);
            System.out.println("Type: " + type);
            System.out.println("Text: " + text);
            System.out.println("Answers: " + answers);

            Question question = questionService.create(documentId, type, text);

            if (answers != null && !answers.isEmpty()) {
                try {
                    List<Map<String, Object>> answerMaps = objectMapper.readValue(
                            answers,
                            new TypeReference<List<Map<String, Object>>>() {}
                    );

                    for (Map<String, Object> answerMap : answerMaps) {
                        String answerText = (String) answerMap.get("text");
                        Boolean isCorrect = (Boolean) answerMap.get("isCorrect");

                        Answer answer = new Answer(question, answerText, isCorrect != null ? isCorrect : false);
                        question.getAnswers().add(answer);
                    }

                    question = questionService.updateQuestion(question.getId(), question);

                    question = questionService.findById(question.getId()).orElse(question);
                } catch (Exception e) {
                    System.err.println("Error parsing answers: " + e.getMessage());
                    e.printStackTrace();
                    return ResponseEntity.badRequest().body("Error parsing answers: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(QuestionDto.fromQuestion(question));
        } catch (Exception e) {
            System.err.println("Error creating question: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error creating question: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQuestion(
            @PathVariable Long id,
            @RequestParam("type") QuestionType type,
            @RequestParam("text") String text,
            @RequestParam(value = "answers", required = false) String answers) {

        try {
            System.out.println("Updating question ID: " + id);
            System.out.println("Type: " + type);
            System.out.println("Text: " + text);
            System.out.println("Answers: " + answers);

            Optional<Question> questionOpt = questionService.update(id, type, text);
            if (!questionOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Question question = questionOpt.get();

            if (answers != null && !answers.isEmpty()) {
                try {
                    question.getAnswers().clear();

                    List<Map<String, Object>> answerMaps = objectMapper.readValue(
                            answers,
                            new TypeReference<List<Map<String, Object>>>() {}
                    );

                    for (Map<String, Object> answerMap : answerMaps) {
                        String answerText = (String) answerMap.get("text");
                        Boolean isCorrect = (Boolean) answerMap.get("isCorrect");

                        Answer answer = new Answer(question, answerText, isCorrect != null ? isCorrect : false);

                        Object idObj = answerMap.get("id");
                        if (idObj != null && idObj instanceof Number) {
                            long answerId = ((Number) idObj).longValue();
                            if (answerId < 1000000000000L) {
                                answer.setId(answerId);
                            }
                        }

                        question.addAnswer(answer);
                    }

                    question = questionService.updateQuestion(id, question);

                    question = questionService.findById(id).orElse(question);

                } catch (Exception e) {
                    System.err.println("Error parsing answers during update: " + e.getMessage());
                    e.printStackTrace();
                    return ResponseEntity.badRequest().body("Error parsing answers: " + e.getMessage());
                }
            }

            return ResponseEntity.ok(QuestionDto.fromQuestion(question));
        } catch (Exception e) {
            System.err.println("Error updating question: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error updating question: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<QuestionDto> deleteQuestion(@PathVariable Long id) {
        try {
            Question question = questionService.delete(id);
            return ResponseEntity.ok(QuestionDto.fromQuestion(question));
        } catch (Exception e) {
            System.err.println("Error deleting question: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
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
}