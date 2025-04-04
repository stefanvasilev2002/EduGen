package com.finki.uiktp.edugen.model.dto;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.enums.DocumentFormat;
import com.finki.uiktp.edugen.model.enums.DocumentType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentDTO {
    private Long id;
    private Long userId;
    private String userEmail;
    private String title;
    private LocalDateTime uploadedDate;
    private String language;
    private DocumentType type;
    private DocumentFormat format;
    private String filePath;
    private int questionCount;

    public DocumentDTO() {
    }

    public DocumentDTO(Long id, Long userId, String userEmail, String title, LocalDateTime uploadedDate,
                       String language, DocumentType type, DocumentFormat format, String filePath, int questionCount) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.title = title;
        this.uploadedDate = uploadedDate;
        this.language = language;
        this.type = type;
        this.format = format;
        this.filePath = filePath;
        this.questionCount = questionCount;
    }

    public static DocumentDTO fromEntity(Document document) {
        if (document == null) {
            return null;
        }

        DocumentDTO dto = new DocumentDTO();
        dto.setId(document.getId());

        if (document.getUser() != null) {
            dto.setUserId(document.getUser().getId());
        }

        dto.setTitle(document.getTitle());
        dto.setUploadedDate(document.getUploadedDate());
        dto.setLanguage(document.getLanguage());
        dto.setType(document.getType());
        dto.setFormat(document.getFormat());
        dto.setFilePath(document.getFilePath());

        if (document.getQuestions() != null) {
            dto.setQuestionCount(document.getQuestions().size());
        } else {
            dto.setQuestionCount(0);
        }

        return dto;
    }
}