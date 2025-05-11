package com.finki.uiktp.edugen.service.Implementation;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.Exceptions.DocumentNotFoundException;
import com.finki.uiktp.edugen.model.Exceptions.QuestionNotFoundException;
import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.enums.QuestionType;
import com.finki.uiktp.edugen.repository.DocumentRepository;
import com.finki.uiktp.edugen.repository.QuestionRepository;
import com.finki.uiktp.edugen.service.QuestionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class QuestionServiceImplementation implements QuestionService {

    private final QuestionRepository questionRepository;
    private final DocumentRepository documentRepository;

    public QuestionServiceImplementation(QuestionRepository questionRepository, DocumentRepository documentRepository) {
        this.questionRepository = questionRepository;
        this.documentRepository = documentRepository;
    }

    @Override
    public List<Question> listAll() {
        return questionRepository.findAll();
    }

    @Override
    public Optional<Question> findById(Long id) {
        return questionRepository.findById(id);
    }

    @Override
    public Question create(Long documentId, QuestionType type, String text) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException(documentId));
        return this.questionRepository.save(new Question(document, text, type));
    }

    @Override
    public Optional<Question> update(Long id, QuestionType type, String text) {
        Question question = this.questionRepository.findById(id)
                .orElseThrow(() -> new QuestionNotFoundException(id));
        question.setType(type);
        question.setText(text);
        return Optional.of(this.questionRepository.save(question));
    }

    @Override
    @Transactional
    public Question updateQuestion(Long id, Question question) {
        question.setId(id);
        return this.questionRepository.save(question);
    }

    @Override
    public Question delete(Long id) {
        Question question = this.questionRepository.findById(id)
                .orElseThrow(() -> new QuestionNotFoundException(id));
        this.questionRepository.delete(question);
        return question;
    }

    @Override
    public List<Question> findByDocumentId(Long documentId) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException(documentId));
        return questionRepository.findByDocument(document);
    }

    @Override
    public List<Question> findByType(QuestionType type) {
        return questionRepository.findByType(type);
    }
}