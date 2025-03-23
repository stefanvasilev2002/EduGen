package com.finki.uiktp.edugen.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long answer_id;

    @ManyToOne
    private Question question;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private boolean isCorrect;

    public Answer() {}

    public Answer(Question question, String text, boolean isCorrect) {
        this.question = question;
        this.text = text;
        this.isCorrect = isCorrect;
    }
}
