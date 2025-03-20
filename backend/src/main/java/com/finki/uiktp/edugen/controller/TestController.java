package com.finki.uiktp.edugen.controller;

import com.finki.uiktp.edugen.model.TestEntity;
import com.finki.uiktp.edugen.repository.TestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class TestController {

    @Autowired
    private TestRepository testRepository;

    @GetMapping("/api/test")
    public Map<String, String> testConnection() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "success");
        response.put("message", "Backend is connected");
        return response;
    }

    @GetMapping("/api/test/db")
    public Map<String, Object> testDatabaseConnection() {
        Map<String, Object> response = new HashMap<>();

        try {
            TestEntity testEntity = new TestEntity();
            testEntity.setName("Test Entity");
            testEntity.setDescription("Created to test database connection");

            TestEntity saved = testRepository.save(testEntity);

            long count = testRepository.count();

            response.put("status", "success");
            response.put("message", "Database connection successful");
            response.put("entityId", saved.getId());
            response.put("entityCount", count);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", "Database connection failed");
            response.put("error", e.getMessage());
        }

        return response;
    }
}