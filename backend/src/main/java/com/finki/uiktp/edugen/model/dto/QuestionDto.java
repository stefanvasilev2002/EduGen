package com.finki.uiktp.edugen.model.dto;

import com.finki.uiktp.edugen.model.Answer;
import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.Question;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class QuestionDto {
    private Long id;
    private String text;
    private String type;
    private Long documentId;
    private String documentTitle;
    private List<AnswerDto> answers = new ArrayList<>();

    @Data
    public static class AnswerDto {
        private Long id;
        private String text;
        private boolean correct;

        public static AnswerDto fromAnswer(Answer answer) {
            AnswerDto dto = new AnswerDto();
            dto.setId(answer.getId());
            dto.setText(answer.getText());
            dto.setCorrect(answer.isCorrect());
            return dto;
        }

        public boolean getIsCorrect() {
            return this.correct;
        }

        public void setIsCorrect(boolean isCorrect) {
            this.correct = isCorrect;
        }
    }

    public static QuestionDto fromQuestion(Question question) {
        QuestionDto dto = new QuestionDto();
        dto.setId(question.getId());
        dto.setText(question.getText());
        dto.setType(question.getType().toString());

        Document document = question.getDocument();
        if (document != null) {
            dto.setDocumentId(document.getId());
            dto.setDocumentTitle(document.getTitle());
        }

        if (question.getAnswers() != null) {
            dto.setAnswers(question.getAnswers().stream()
                    .map(AnswerDto::fromAnswer)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}