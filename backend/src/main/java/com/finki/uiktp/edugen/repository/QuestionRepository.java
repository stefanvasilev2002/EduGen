package com.finki.uiktp.edugen.repository;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.enums.QuestionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByDocument(Document document);

    List<Question> findByType(QuestionType type);

    List<Question> findByDocumentAndType(Document document, QuestionType type);
}
