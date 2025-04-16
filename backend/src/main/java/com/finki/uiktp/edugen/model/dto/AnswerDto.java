package com.finki.uiktp.edugen.model.dto;

import com.finki.uiktp.edugen.model.Answer;
import lombok.Data;

@Data
public class AnswerDto {
    private Long id;
    private String text;
    private boolean isCorrect;

    public static AnswerDto fromAnswer(Answer answer) {
        AnswerDto dto = new AnswerDto();
        dto.setId(answer.getId());
        dto.setText(answer.getText());
        dto.setCorrect(answer.isCorrect());
        return dto;
    }
}