package com.finki.uiktp.edugen.model;

import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime uploadedDate;

    @Column(nullable = false)
    private String language;

    @Enumerated(EnumType.STRING)
    private DocumentType type; //TEXTBOOK, SCRIPT ,LECTURE ,RESEARCH ,OTHER

    @Enumerated(EnumType.STRING)
    private DocumentFormat format; //PDF, DOCX, TXT

    @Column(nullable = false)
    private String filePath;

    @OneToMany(mappedBy = "document", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

    public Document() {

    }

    public Document(User user, String title, LocalDateTime uploadedDate, String language, DocumentType type, DocumentFormat format, String filePath) {
        this.user = user;
        this.title = title;
        this.uploadedDate = uploadedDate;
        this.language = language;
        this.type = type;
        this.format = format;
        this.filePath = filePath;
    }

}
