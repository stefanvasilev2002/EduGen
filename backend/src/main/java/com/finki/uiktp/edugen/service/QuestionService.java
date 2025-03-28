package com.finki.uiktp.edugen.service;

import com.finki.uiktp.edugen.model.Answer;
import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.enums.QuestionType;

import java.util.List;
import java.util.Optional;

public interface QuestionService {
    List<Question> listAll();

    Optional<Question> findById(Long id);

    Question create(Long document, QuestionType type, String text);

    Optional<Question> update(Long id, QuestionType type, String text);

    Question delete(Long id);
}
