package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.Exceptions.DocumentNotFoundException;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.service.DocumentService;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.FileInputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = "*")
public class DocumentDownloadController {

    private final DocumentService documentService;

    public DocumentDownloadController(DocumentService documentService) {
        this.documentService = documentService;
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