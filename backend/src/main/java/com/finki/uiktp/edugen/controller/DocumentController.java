package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;
import com.finki.uiktp.edugen.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public List<Document> findAll() {
        return this.documentService.listAll();
    }
    @GetMapping("/{id}")
    public ResponseEntity<Document> findById(@PathVariable Long id) {
        return this.documentService.findById(id)
                .map(question -> ResponseEntity.ok().body(question))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/title/{title}")
    public ResponseEntity<Document> findByTitle(@PathVariable String title) {
        return this.documentService.findByTitle(title)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Document> create(@RequestParam Long userId,
                                           @RequestParam String title,
                                           @RequestParam String language,
                                           @RequestParam DocumentType type,
                                           @RequestParam DocumentFormat format,
                                           @RequestParam String filePath) {
        Document document = this.documentService.create(userId, title, LocalDateTime.now(), language, type, format, filePath);
        return ResponseEntity.ok(document);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Document> update(@PathVariable Long id,
                                           @RequestParam String title,
                                           @RequestParam String language,
                                           @RequestParam DocumentType type,
                                           @RequestParam DocumentFormat format,
                                           @RequestParam String filePath) {
        return this.documentService.update(id, title, language, type, format, filePath)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Document> deleteById(@PathVariable Long id) {
        this.documentService.delete(id);
        if(this.documentService.findById(id).isEmpty()) return ResponseEntity.ok().build();
        return ResponseEntity.badRequest().build();
    }
}
