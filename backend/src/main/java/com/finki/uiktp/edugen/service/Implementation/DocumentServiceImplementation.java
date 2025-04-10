package com.finki.uiktp.edugen.service.Implementation;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.Exceptions.DocumentNotFoundException;
import com.finki.uiktp.edugen.model.Exceptions.UserNotFoundException;
import com.finki.uiktp.edugen.model.User;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;
import com.finki.uiktp.edugen.repository.DocumentRepository;
import com.finki.uiktp.edugen.repository.UserRepository;
import com.finki.uiktp.edugen.service.DocumentService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class DocumentServiceImplementation implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    public DocumentServiceImplementation(DocumentRepository documentRepository, UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }


    @Override
    public List<Document> listAll() {
        return this.documentRepository.findAll();
    }

    @Override
    public Optional<Document> findById(Long id) {
        return this.documentRepository.findById(id);
    }

    @Override
    public Optional<Document> findByTitle(String title) {
        return this.documentRepository.findByTitle(title);
    }

    @Override
    public Document create(Long userId, String title, LocalDateTime uploadedDate, String language, DocumentType type, DocumentFormat format, String filePath) {
        User user = userRepository.findById(userId).orElseThrow(() -> new UserNotFoundException(userId));
        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException();
        }
        Document document = new Document(user, title, language, type, format, filePath);
        return this.documentRepository.save(document);
    }

    @Override
    public Optional<Document> update(Long id, String title, String language, DocumentType type, DocumentFormat format, String filePath) {
        Document document = this.documentRepository.findById(id).orElseThrow(() -> new DocumentNotFoundException(id));
        document.setTitle(title);
        document.setLanguage(language);
        document.setType(type);
        document.setFormat(format);
        document.setFilePath(filePath);
        return Optional.of(this.documentRepository.save(document));
    }


    @Override
    public Document delete(Long id) {
        Document document = this.documentRepository.findById(id)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        try {
            Path filePath = Paths.get(document.getFilePath());
            if (Files.exists(filePath)) {
                Files.delete(filePath);
            }
        } catch (IOException e) {
            System.err.println("Failed to delete file: " + document.getFilePath() + " - " + e.getMessage());
        }

        this.documentRepository.delete(document);
        return document;
    }
}