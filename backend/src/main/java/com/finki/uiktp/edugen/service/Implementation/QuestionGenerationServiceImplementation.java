package com.finki.uiktp.edugen.service.Implementation;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.Exceptions.DocumentNotFoundException;
import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.dto.GenerateQuestionsRequest;
import com.finki.uiktp.edugen.model.dto.GeneratedQuestionDto;
import com.finki.uiktp.edugen.model.enums.QuestionType;
import com.finki.uiktp.edugen.repository.DocumentRepository;
import com.finki.uiktp.edugen.service.AnswerService;
import com.finki.uiktp.edugen.service.QuestionGenerationService;
import com.finki.uiktp.edugen.service.QuestionService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class QuestionGenerationServiceImplementation implements QuestionGenerationService {

    private final DocumentRepository documentRepository;
    private final QuestionService questionService;
    private final AnswerService answerService;
    private final RestTemplate restTemplate;

    @Value("${ai.generation.api-url:https://api.openai.com/v1/chat/completions}")
    private String aiApiUrl;

    @Value("${ai.generation.api-key:}")
    private String apiKey;

    public QuestionGenerationServiceImplementation(DocumentRepository documentRepository,
                                                   QuestionService questionService,
                                                   AnswerService answerService,
                                                   RestTemplate restTemplate) {
        this.documentRepository = documentRepository;
        this.questionService = questionService;
        this.answerService = answerService;
        this.restTemplate = restTemplate;
    }

    @Override
    public List<Question> generateQuestions(Long documentId, GenerateQuestionsRequest request) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException(documentId));

        List<GeneratedQuestionDto> generatedQuestions = callAiGenerationApi(document, request);

        List<Question> savedQuestions = new ArrayList<>();

        for (GeneratedQuestionDto generatedQuestion : generatedQuestions) {
            Question question = questionService.create(
                    documentId,
                    convertToQuestionType(generatedQuestion.getType()),
                    generatedQuestion.getText());

            for (Map<String, Object> answerData : generatedQuestion.getAnswers()) {
                String answerText = (String) answerData.get("text");
                Boolean isCorrect = (Boolean) answerData.get("isCorrect");

                answerService.create(question.getId(), answerText, isCorrect);
            }

            savedQuestions.add(question);
        }

        return savedQuestions;
    }

    private QuestionType convertToQuestionType(String type) {
        try {
            return QuestionType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            return QuestionType.MULTIPLE_CHOICE;
        }
    }

    private List<GeneratedQuestionDto> callAiGenerationApi(Document document, GenerateQuestionsRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("Authorization", "Bearer " + apiKey);
        }

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gpt-3.5-turbo");

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", "You are a helpful assistant that generates educational questions and answers."));

        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Generate ");
        promptBuilder.append(request.getQuestionCount());
        promptBuilder.append(" ");
        promptBuilder.append(request.getDifficultyLevel().toLowerCase());
        promptBuilder.append(" difficulty ");

        promptBuilder.append("questions of the following types: ");
        promptBuilder.append(String.join(", ", request.getQuestionTypes()));

        promptBuilder.append(" based on the following content:\n\n");
        promptBuilder.append(document.getContent());

        promptBuilder.append("\n\nFormat your response as a JSON array where each question object contains 'text', 'type', and 'answers' fields.");
        promptBuilder.append(" Each answer should have 'text' and 'isCorrect' fields.");
        promptBuilder.append(" The response language should be: " + request.getLanguage());

        messages.add(Map.of("role", "user", "content", promptBuilder.toString()));
        requestBody.put("messages", messages);

        // Add other parameters
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 2000);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            //ResponseEntity<Map> response = restTemplate.postForEntity(aiApiUrl, entity, Map.class);

            //String aiResponse = extractContentFromAiResponse(response.getBody());
            return parseQuestionsFromAiResponse(new String());
        } catch (Exception e) {
            throw new RuntimeException("Error calling AI generation API: " + e.getMessage(), e);
        }
    }

    private String extractContentFromAiResponse(Map responseBody) {
        // This extraction logic will depend on the structure of the AI API response
        // For OpenAI, the structure is typically:
        // { "choices": [ { "message": { "content": "the response text" } } ] }
        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        return (String) message.get("content");
    }

    private List<GeneratedQuestionDto> parseQuestionsFromAiResponse(String aiResponse) {
        // This would be improved with a proper JSON parsing library like Jackson
        // For now, let's create a simple implementation
        // Note: In a real scenario, you would use ObjectMapper to parse the JSON response

        // Mock implementation - in real code, parse the JSON response
        List<GeneratedQuestionDto> result = new ArrayList<>();

        // Example of how to create mock questions (replace with actual JSON parsing)
        GeneratedQuestionDto mockQuestion = new GeneratedQuestionDto();
        mockQuestion.setText("What is the main purpose of a constructor in OOP?");
        mockQuestion.setType("MULTIPLE_CHOICE");

        List<Map<String, Object>> answers = new ArrayList<>();
        answers.add(Map.of("text", "To initialize object properties", "isCorrect", true));
        answers.add(Map.of("text", "To destroy objects when they're no longer needed", "isCorrect", false));

        mockQuestion.setAnswers(answers);

        result.add(mockQuestion);

        return result;
    }
}