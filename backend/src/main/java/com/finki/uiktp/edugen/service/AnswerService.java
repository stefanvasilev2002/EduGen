package com.finki.uiktp.edugen.service;

import com.finki.uiktp.edugen.model.Answer;

import java.util.List;
import java.util.Optional;

public interface AnswerService {
    List<Answer> listAll();

    Optional<Answer> findById(Long id);

    Answer create(Long questionId, String text, Boolean isCorrect);

    Optional<Answer> update(Long id, String text, Boolean isCorrect);

    Answer delete(Long id);
}
