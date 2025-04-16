package com.finki.uiktp.edugen.model.dto;

import lombok.Data;

import java.util.List;

@Data
public class GenerateQuestionsRequest {
    private Integer questionCount;
    private String difficultyLevel;
    private List<String> questionTypes;
    private Boolean includeAnswers;
    private String language;
}