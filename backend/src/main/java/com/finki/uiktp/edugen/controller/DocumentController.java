package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.dto.DocumentDTO;
import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;
import com.finki.uiktp.edugen.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public List<DocumentDTO> findAll() {
        return this.documentService.listAll().stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDTO> findById(@PathVariable Long id) {
        return this.documentService.findById(id)
                .map(DocumentDTO::fromEntity)
                .map(documentDTO -> ResponseEntity.ok().body(documentDTO))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/title/{title}")
    public ResponseEntity<DocumentDTO> findByTitle(@PathVariable String title) {
        return this.documentService.findByTitle(title)
                .map(DocumentDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<DocumentDTO> create(@RequestParam Long userId,
                                              @RequestParam String title,
                                              @RequestParam String language,
                                              @RequestParam DocumentType type,
                                              @RequestParam DocumentFormat format,
                                              @RequestParam String filePath) {
        Document document = this.documentService.create(userId, title, LocalDateTime.now(), language, type, format, filePath);
        return ResponseEntity.ok(DocumentDTO.fromEntity(document));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentDTO> update(@PathVariable Long id,
                                              @RequestParam String title,
                                              @RequestParam String language,
                                              @RequestParam DocumentType type,
                                              @RequestParam DocumentFormat format,
                                              @RequestParam String filePath) {
        return this.documentService.update(id, title, language, type, format, filePath)
                .map(DocumentDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        this.documentService.delete(id);
        if(this.documentService.findById(id).isEmpty()) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }
}