package com.finki.uiktp.edugen.repository;

import com.finki.uiktp.edugen.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    Optional<Document> findByTitle(String title);
}
