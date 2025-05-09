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
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
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
    private final String UPLOAD_DIR = "uploads/";

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
            String extension = null;
            if (originalFilename != null) {
                extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
            }
            String uniqueFilename = UUID.randomUUID() + "_" + originalFilename;
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);
            Files.write(filePath, file.getBytes());

            DocumentType type = DocumentType.valueOf(documentType);
            DocumentFormat format = null;
            if (extension != null) {
                format = DocumentFormat.valueOf(extension.toUpperCase());
            }

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

    /*@GetMapping("/{id}/download")
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
    }*/

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
    /**
     * Download a document by ID
     * @param id - Document ID
     * @return ResponseEntity with the document file
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<?> downloadDocument(@PathVariable Long id) {
        try {
            Document document = documentService.findById(id)
                    .orElseThrow(() -> new DocumentNotFoundException(id));

            Path filePath = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = switch (document.getFormat()) {
                case PDF -> "application/pdf";
                case DOCX -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                case TXT -> "text/plain";
            };

            String originalFilename = filePath.getFileName().toString();
            String cleanFilename = originalFilename.substring(originalFilename.indexOf("_") + 1);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + cleanFilename + "\"")
                    .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, "Content-Disposition")
                    .body(resource);

        } catch (DocumentNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Get document content for preview
     * Works for text-based documents (TXT, PDF, DOCX)
     * @param id - Document ID
     * @return ResponseEntity with document content
     */
    @GetMapping("/{id}/content")
    public ResponseEntity<?> getDocumentContent(@PathVariable Long id) {
        try {
            Document document = documentService.findById(id)
                    .orElseThrow(() -> new DocumentNotFoundException(id));

            Path filePath = Paths.get(document.getFilePath());
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            if (document.getFormat() == DocumentFormat.TXT) {
                String content = Files.readString(filePath, StandardCharsets.UTF_8);
                return ResponseEntity.ok(content);
            }

            else if (document.getFormat() == DocumentFormat.PDF) {
                try (PDDocument pdf = PDDocument.load(filePath.toFile())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    String text = stripper.getText(pdf);
                    return ResponseEntity.ok(text);
                }
            }

            else if (document.getFormat() == DocumentFormat.DOCX) {
                try (FileInputStream fis = new FileInputStream(filePath.toFile());
                     XWPFDocument docx = new XWPFDocument(fis)) {
                    XWPFWordExtractor extractor = new XWPFWordExtractor(docx);
                    String text = extractor.getText();
                    return ResponseEntity.ok(text);
                }
            }

            return ResponseEntity.badRequest().body("Preview is not available for this file format");

        } catch (DocumentNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error reading file: " + e.getMessage());
        }
    }

    /**
     * View a document in the browser
     * @param id - Document ID
     * @return ResponseEntity with document for in-browser viewing
     */
    @GetMapping("/{id}/view")
    public ResponseEntity<?> viewDocument(@PathVariable Long id) {
        try {
            Document document = documentService.findById(id)
                    .orElseThrow(() -> new DocumentNotFoundException(id));

            Path filePath = Paths.get(document.getFilePath());
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                return ResponseEntity.notFound().build();
            }

            if (document.getFormat() == DocumentFormat.PDF || document.getFormat() == DocumentFormat.TXT) {
                String contentType = document.getFormat() == DocumentFormat.PDF
                        ? "application/pdf"
                        : "text/plain";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                        .body(resource);
            } else {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getTitle() + "\"")
                        .body(resource);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error viewing document: " + e.getMessage());
        }
    }

    /**
     * Get document metadata
     * @param id - Document ID
     * @return ResponseEntity with document metadata
     */
    @GetMapping("/{id}/metadata")
    public ResponseEntity<?> getDocumentMetadata(@PathVariable Long id) {
        try {
            Document document = documentService.findById(id)
                    .orElseThrow(() -> new DocumentNotFoundException(id));

            Path filePath = Paths.get(document.getFilePath());
            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("id", document.getId());
            metadata.put("title", document.getTitle());
            metadata.put("format", document.getFormat().toString());
            metadata.put("type", document.getType().toString());
            metadata.put("language", document.getLanguage());
            metadata.put("uploadedDate", document.getUploadedDate().toString());
            metadata.put("fileSize", Files.size(filePath));
            metadata.put("canPreview", document.getFormat() == DocumentFormat.TXT ||
                    document.getFormat() == DocumentFormat.PDF);
            metadata.put("canView", document.getFormat() == DocumentFormat.TXT ||
                    document.getFormat() == DocumentFormat.PDF);

            return ResponseEntity.ok(metadata);

        } catch (DocumentNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error reading file: " + e.getMessage());
        }
    }
}