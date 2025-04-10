package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.dto.DocumentDTO;
import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.Exceptions.DocumentNotFoundException;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;
import com.finki.uiktp.edugen.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "*")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Get all documents with optional filtering
     */
    @GetMapping
    public List<DocumentDTO> findAll(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String language,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String format,
            @RequestParam(required = false) String sort,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {

        List<Document> documents = this.documentService.listAll();

        if (title != null && !title.isEmpty()) {
            documents = documents.stream()
                    .filter(doc -> doc.getTitle().toLowerCase().contains(title.toLowerCase()))
                    .collect(Collectors.toList());
        }

        if (language != null && !language.isEmpty()) {
            documents = documents.stream()
                    .filter(doc -> doc.getLanguage().equals(language))
                    .collect(Collectors.toList());
        }

        if (type != null && !type.isEmpty()) {
            try {
                DocumentType documentType = DocumentType.valueOf(type.toUpperCase());
                documents = documents.stream()
                        .filter(doc -> doc.getType() == documentType)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {
            }
        }

        if (format != null && !format.isEmpty()) {
            try {
                DocumentFormat documentFormat = DocumentFormat.valueOf(format.toUpperCase());
                documents = documents.stream()
                        .filter(doc -> doc.getFormat() == documentFormat)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException ignored) {
            }
        }

        if (sort != null && !sort.isEmpty()) {
            boolean descending = sort.contains("desc");
            String sortField = sort.split(",")[0];

            switch (sortField) {
                case "title":
                    documents = descending
                            ? documents.stream().sorted((d1, d2) -> d2.getTitle().compareTo(d1.getTitle())).collect(Collectors.toList())
                            : documents.stream().sorted(Comparator.comparing(Document::getTitle)).collect(Collectors.toList());
                    break;
                case "uploadedDate":
                    documents = descending
                            ? documents.stream().sorted((d1, d2) -> d2.getUploadedDate().compareTo(d1.getUploadedDate())).collect(Collectors.toList())
                            : documents.stream().sorted(Comparator.comparing(Document::getUploadedDate)).collect(Collectors.toList());
                    break;
                default:
                    break;
            }
        }

        if (limit > 0 && documents.size() > limit) {
            documents = documents.subList(0, limit);
        }

        return documents.stream()
                .map(DocumentDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get document by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<DocumentDTO> findById(@PathVariable Long id) {
        return this.documentService.findById(id)
                .map(DocumentDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Find document by title
     */
    @GetMapping("/title/{title}")
    public ResponseEntity<DocumentDTO> findByTitle(@PathVariable String title) {
        return this.documentService.findByTitle(title)
                .map(DocumentDTO::fromEntity)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Create a new document
     */
    @PostMapping
    public ResponseEntity<DocumentDTO> create(
            @RequestParam Long userId,
            @RequestParam String title,
            @RequestParam String language,
            @RequestParam String type,
            @RequestParam String format,
            @RequestParam String filePath) {

        try {
            DocumentType documentType = DocumentType.valueOf(type.toUpperCase());
            DocumentFormat documentFormat = DocumentFormat.valueOf(format.toUpperCase());

            Document document = this.documentService.create(userId, title, LocalDateTime.now(),
                    language, documentType, documentFormat, filePath);
            return ResponseEntity.ok(DocumentDTO.fromEntity(document));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update an existing document
     */
    @PutMapping("/{id}")
    public ResponseEntity<DocumentDTO> update(
            @PathVariable Long id,
            @RequestParam String title,
            @RequestParam String language,
            @RequestParam String type,
            @RequestParam String format,
            @RequestParam String filePath) {

        try {
            DocumentType documentType = DocumentType.valueOf(type.toUpperCase());
            DocumentFormat documentFormat = DocumentFormat.valueOf(format.toUpperCase());

            Document document = this.documentService.findById(id)
                    .orElseThrow(() -> new DocumentNotFoundException(id));

            return this.documentService.update(id, title, language, documentType, documentFormat, filePath)
                    .map(DocumentDTO::fromEntity)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (DocumentNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a document
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteById(@PathVariable Long id) {
        try {
            this.documentService.findById(id)
                    .orElseThrow(() -> new DocumentNotFoundException(id));

            this.documentService.delete(id);
            return ResponseEntity.ok().build();
        } catch (DocumentNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}