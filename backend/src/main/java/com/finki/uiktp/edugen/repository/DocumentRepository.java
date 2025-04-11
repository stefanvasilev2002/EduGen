package com.finki.uiktp.edugen.repository;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    Optional<Document> findByTitle(String title);

    List<Document> findAllByUser(User user);

    Optional<Document> findByIdAndUser(Long id, User user);

    @Query(value = "SELECT d.* FROM document d WHERE d.user_id = :#{#user.id} ORDER BY d.uploaded_date DESC LIMIT :limit", nativeQuery = true)
    List<Document> findByUserOrderByUploadedDateDesc(@Param("user") User user, @Param("limit") int limit);
}