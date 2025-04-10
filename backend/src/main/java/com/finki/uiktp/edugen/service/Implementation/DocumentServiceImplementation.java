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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import jakarta.annotation.PostConstruct;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentServiceImplementation implements DocumentService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public DocumentServiceImplementation(DocumentRepository documentRepository, UserRepository userRepository) {
        this.documentRepository = documentRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void init() {
        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    @Override
    public List<Document> listAll() {
        return this.documentRepository.findAll();
    }

    @Override
    public List<Document> listAllByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return documentRepository.findAllByUser(user);
    }

    @Override
    public List<Document> getRecentDocuments(int limit, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        return documentRepository.findByUserOrderByUploadedDateDesc(user, limit);
    }

    @Override
    public Optional<Document> findById(Long id) {
        return this.documentRepository.findById(id);
    }

    @Override
    public Optional<Document> findByIdAndUserId(Long id, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));
        return documentRepository.findByIdAndUser(id, user);
    }

    @Override
    public Optional<Document> findByTitle(String title) {
        return this.documentRepository.findByTitle(title);
    }

    @Override
    public Document create(Long userId, String title, LocalDateTime uploadedDate, String language, DocumentType type, DocumentFormat format, String filePath) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }

        Document document = new Document(user, title, language, type, format, filePath);
        return this.documentRepository.save(document);
    }

    @Override
    public Document uploadDocument(Long userId, String title, String language, DocumentType type, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (title == null || title.isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toUpperCase();
        DocumentFormat format;
        try {
            format = DocumentFormat.valueOf(extension);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Unsupported file format: " + extension);
        }

        String newFilename = UUID.randomUUID() + "." + extension.toLowerCase();
        Path filePath = Paths.get(uploadDir, newFilename);

        Files.createDirectories(filePath.getParent());

        Files.write(filePath, file.getBytes());

        Document document = new Document(user, title, language, type, format, filePath.toString());
        return this.documentRepository.save(document);
    }

    @Override
    public Optional<Document> update(Long id, Long userId, String title, String language, DocumentType type, DocumentFormat format) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Document document = documentRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        document.setTitle(title);
        document.setLanguage(language);
        document.setType(type);
        document.setFormat(format);

        return Optional.of(this.documentRepository.save(document));
    }

    @Override
    public Document delete(Long id, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Document document = documentRepository.findByIdAndUser(id, user)
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

    @Override
    public byte[] getDocumentContent(Long id, Long userId) throws IOException {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        Document document = documentRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new DocumentNotFoundException(id));

        Path filePath = Paths.get(document.getFilePath());
        if (!Files.exists(filePath)) {
            throw new IOException("File not found: " + document.getFilePath());
        }

        return Files.readAllBytes(filePath);
    }
}