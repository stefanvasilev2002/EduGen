package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.config.UserPrincipal;
import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.Exceptions.DocumentNotFoundException;
import com.finki.uiktp.edugen.model.Exceptions.UserNotFoundException;
import com.finki.uiktp.edugen.model.User;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;
import com.finki.uiktp.edugen.repository.UserRepository;
import com.finki.uiktp.edugen.service.DocumentService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final UserRepository userRepository;
    private final String UPLOAD_DIR = "uploads";

    public DocumentController(DocumentService documentService, UserRepository userRepository) {
        this.documentService = documentService;
        this.userRepository = userRepository;

        new java.io.File(UPLOAD_DIR).mkdirs();
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllDocuments(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        List<Document> documents = user.getDocuments();

        List<Map<String, Object>> result = documents.stream()
                .map(this::convertDocumentToMap)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDocumentById(
            @PathVariable Long id,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        Document document = documentService.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        if (!document.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(convertDocumentToMap(document));
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("language") String language,
            @RequestParam("type") String documentType,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
            String newFilename = UUID.randomUUID() + "." + extension;

            Path filePath = Paths.get(UPLOAD_DIR, newFilename);
            Files.write(filePath, file.getBytes());

            DocumentType type = DocumentType.valueOf(documentType);
            DocumentFormat format = DocumentFormat.valueOf(extension.toUpperCase());

            Document document = documentService.create(
                    userId,
                    title,
                    LocalDateTime.now(),
                    language,
                    type,
                    format,
                    filePath.toString()
            );

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(convertDocumentToMap(document));

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateDocument(
            @PathVariable Long id,
            @RequestBody Map<String, String> updateData,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        Document document = documentService.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        if (!document.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        String title = updateData.get("title");
        String language = updateData.get("language");
        DocumentType type = DocumentType.valueOf(updateData.get("type"));
        DocumentFormat format = document.getFormat();

        return documentService.update(id, userId, title, language, type, format)
                .map(updatedDoc -> ResponseEntity.ok(convertDocumentToMap(updatedDoc)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        Document document = documentService.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        if (!document.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        documentService.delete(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable Long id,
            Authentication authentication) {

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        Long userId = userPrincipal.getId();

        Document document = documentService.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        if (!document.getUser().getId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            Path filePath = Paths.get(document.getFilePath());
            byte[] fileContent = Files.readAllBytes(filePath);

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=" + document.getTitle() + "." +
                            document.getFormat().toString().toLowerCase());

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private Map<String, Object> convertDocumentToMap(Document document) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", document.getId());
        map.put("title", document.getTitle());
        map.put("uploadedDate", document.getUploadedDate());
        map.put("language", document.getLanguage());
        map.put("type", document.getType().name());
        map.put("format", document.getFormat().name());
        return map;
    }
}