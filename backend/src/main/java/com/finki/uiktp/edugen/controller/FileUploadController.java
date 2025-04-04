package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;
import com.finki.uiktp.edugen.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/documents/upload")
public class FileUploadController {

    private final DocumentService documentService;
    private final String UPLOAD_DIR = "uploads/";

    public FileUploadController(DocumentService documentService) {
        this.documentService = documentService;
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @PostMapping
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") Long userId,
            @RequestParam("title") String title,
            @RequestParam("language") String language,
            @RequestParam("type") DocumentType type,
            @RequestParam("format") DocumentFormat format) {

        if (file.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Please select a file to upload");
            return ResponseEntity.badRequest().body(response);
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "File size should not exceed 5MB");
            return ResponseEntity.badRequest().body(response);
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Invalid file name");
            return ResponseEntity.badRequest().body(response);
        }

        String fileExtension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
        if (!isValidFileType(fileExtension)) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Only PDF, DOCX, and TXT files are allowed");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            String uniqueFilename = UUID.randomUUID().toString() + "_" + originalFilename;
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);

            Files.copy(file.getInputStream(), filePath);

            Document document = documentService.create(
                    userId,
                    title,
                    LocalDateTime.now(),
                    language,
                    type,
                    format,
                    filePath.toString()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Document uploaded successfully");
            response.put("documentId", document.getId());
            response.put("filePath", filePath.toString());

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Failed to upload document: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "An error occurred: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    private boolean isValidFileType(String fileExtension) {
        return fileExtension.equals("pdf") ||
                fileExtension.equals("docx") ||
                fileExtension.equals("txt");
    }
}