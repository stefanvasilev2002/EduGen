package com.finki.uiktp.edugen.model.Exceptions;

import com.finki.uiktp.edugen.model.Question;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND)
public class QuestionNotFoundException extends RuntimeException {
    public QuestionNotFoundException(Long id) {
        super(String.format("Question with id: %d was not found", id));
    }
}
