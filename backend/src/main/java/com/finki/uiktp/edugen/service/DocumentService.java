package com.finki.uiktp.edugen.service;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DocumentService {
    List<Document> listAll();
    Optional<Document> findById(Long id);
    Optional<Document> findByTitle(String title);
    List<Document> listAllByUserId(Long userId);
    List<Document> getRecentDocuments(int limit, Long userId);
    Optional<Document> findByIdAndUserId(Long id, Long userId);

    Document create(Long userId, String title, LocalDateTime uploadedDate, String language,
                    DocumentType type, DocumentFormat format, String filePath);

    Document uploadDocument(Long userId, String title, String language,
                            DocumentType type, MultipartFile file) throws IOException;

    Optional<Document> update(Long id, Long userId, String title, String language,
                              DocumentType type, DocumentFormat format);

    Document delete(Long id, Long userId);

    byte[] getDocumentContent(Long id, Long userId) throws IOException;

    String getDocumentContent(Document document) throws IOException;
}