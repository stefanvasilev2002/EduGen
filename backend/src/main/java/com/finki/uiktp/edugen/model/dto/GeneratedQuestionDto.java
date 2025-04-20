package com.finki.uiktp.edugen.model.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class GeneratedQuestionDto {
    private String text;
    private String type;
    private List<Map<String, Object>> answers;
}