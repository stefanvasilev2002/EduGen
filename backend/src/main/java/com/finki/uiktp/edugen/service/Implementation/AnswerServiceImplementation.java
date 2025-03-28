package com.finki.uiktp.edugen.service.Implementation;

import com.finki.uiktp.edugen.model.Answer;
import com.finki.uiktp.edugen.model.Exceptions.AnswerNotFoundException;
import com.finki.uiktp.edugen.model.Exceptions.QuestionNotFoundException;
import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.repository.AnswerRepository;
import com.finki.uiktp.edugen.repository.QuestionRepository;
import com.finki.uiktp.edugen.service.AnswerService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AnswerServiceImplementation implements AnswerService {

    private final AnswerRepository answerRepository;
    private final QuestionRepository questionRepository;

    public AnswerServiceImplementation(AnswerRepository answerRepository, QuestionRepository questionRepository) {
        this.answerRepository = answerRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    public List<Answer> listAll() {
        return answerRepository.findAll();
    }

    @Override
    public Optional<Answer> findById(Long id) {
        return answerRepository.findById(id);
    }

    @Override
    public Answer create(Long questionId, String text, Boolean isCorrect) {
        Question question = questionRepository.findById(questionId).orElseThrow(() -> new QuestionNotFoundException(questionId));
        Answer answer = new Answer(question, text, isCorrect);
        return answerRepository.save(answer);
    }

    @Override
    public Optional<Answer> update(Long id, String text, Boolean isCorrect) {
        Answer answer = this.answerRepository.findById(id).orElseThrow(() -> new AnswerNotFoundException(id));
        answer.setText(text);
        answer.setCorrect(isCorrect);
        return Optional.of(this.answerRepository.save(answer));
    }

    @Override
    public Answer delete(Long id) {
        Answer answer = this.answerRepository.findById(id).orElseThrow(() -> new AnswerNotFoundException(id));
        this.answerRepository.delete(answer);
        return answer;
    }
}
