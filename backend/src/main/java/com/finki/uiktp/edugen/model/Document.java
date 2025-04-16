package com.finki.uiktp.edugen.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    private DocumentType type;

    @Enumerated(EnumType.STRING)
    private DocumentFormat format;

    @Column(nullable = false)
    private String language;

    @Column(name = "uploaded_date", nullable = false)
    private LocalDateTime uploadedDate;

    @Column(name = "file_path")
    private String filePath;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Question> questions = new ArrayList<>();

    public Document() {
        this.uploadedDate = LocalDateTime.now();
    }

    public Document(String title, DocumentType type, DocumentFormat format, String language, String filePath, String content, User user) {
        this.title = title;
        this.type = type;
        this.format = format;
        this.language = language;
        this.filePath = filePath;
        this.content = content;
        this.user = user;
        this.uploadedDate = LocalDateTime.now();
    }

    public Document(User user, String title, String language, DocumentType type, DocumentFormat format, String filePath, String content) {
        this.user = user;
        this.title = title;
        this.language = language;
        this.type = type;
        this.format = format;
        this.filePath = filePath;
        this.uploadedDate = LocalDateTime.now();
        this.content = content;
    }

    public Document(User user, String title, String language, DocumentType type, DocumentFormat format, String filePath) {
        this.user = user;
        this.title = title;
        this.language = language;
        this.type = type;
        this.format = format;
        this.filePath = filePath;
        this.uploadedDate = LocalDateTime.now();
    }
}