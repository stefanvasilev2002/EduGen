package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.Answer;
import com.finki.uiktp.edugen.service.AnswerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/answers")
public class AnswerController {

    private final AnswerService answerService;

    public AnswerController(AnswerService answerService) {
        this.answerService = answerService;
    }

    @GetMapping
    public List<Answer> findAll() {
        return this.answerService.listAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Answer> findById(@PathVariable Long id) {
        return this.answerService.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Answer> create(@RequestParam Long questionId,
                                         @RequestParam String text,
                                         @RequestParam Boolean isCorrect) {
        return ResponseEntity.ok(this.answerService.create(questionId, text, isCorrect));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Answer> update(@PathVariable Long id,
                                         @RequestParam String text,
                                         @RequestParam Boolean isCorrect) {
        return this.answerService.update(id, text, isCorrect)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        this.answerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
