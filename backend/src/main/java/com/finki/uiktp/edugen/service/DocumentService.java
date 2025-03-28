package com.finki.uiktp.edugen.service;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DocumentService {

    List<Document> listAll();

    Optional<Document> findById(Long id);

    Optional<Document> findByTitle(String title);

    Document create(Long user, String title, LocalDateTime uploadedDate, String language, DocumentType type, DocumentFormat format, String filePath);

    Optional<Document> update(Long id, String title, String language, DocumentType type, DocumentFormat format, String filePath);

    Document delete(Long id);


}
