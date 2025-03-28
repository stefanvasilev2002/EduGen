package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.Answer;
import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.enums.QuestionType;
import com.finki.uiktp.edugen.service.QuestionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @GetMapping
    public List<Question> findAll() {
        return this.questionService.listAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> findById(@PathVariable Long id) {
        return this.questionService.findById(id)
                .map(question -> ResponseEntity.ok().body(question))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Question> create(@RequestParam Long documentId,
                                           @RequestParam QuestionType type,
                                           @RequestParam String text) {
        return ResponseEntity.ok(this.questionService.create(documentId, type, text));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Question> update(@PathVariable Long id,
                                           @RequestParam QuestionType type,
                                           @RequestParam String text) {
        return this.questionService.update(id, type, text)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Question> deleteById(@PathVariable Long id) {
        this.questionService.delete(id);
        if (this.questionService.findById(id).isEmpty()) return ResponseEntity.ok().build();
        return ResponseEntity.badRequest().build();
    }
}
