package com.finki.uiktp.edugen.service.Implementation;

import com.finki.uiktp.edugen.model.Document;
import com.finki.uiktp.edugen.model.Exceptions.DocumentNotFoundException;
import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.model.dto.GenerateQuestionsRequest;
import com.finki.uiktp.edugen.model.dto.GeneratedQuestionDto;
import com.finki.uiktp.edugen.model.enums.QuestionType;
import com.finki.uiktp.edugen.repository.DocumentRepository;
import com.finki.uiktp.edugen.service.AnswerService;
import com.finki.uiktp.edugen.service.DocumentService;
import com.finki.uiktp.edugen.service.QuestionGenerationService;
import com.finki.uiktp.edugen.service.QuestionService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.*;

@Service
public class QuestionGenerationServiceImplementation implements QuestionGenerationService {

    private final DocumentRepository documentRepository;
    private final QuestionService questionService;
    private final AnswerService answerService;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final DocumentService documentService;

    @Value("${ai.generation.api-url:https://api.openai.com/v1/chat/completions}")
    private String aiApiUrl;

    @Value("${ai.generation.api-key:}")
    private String apiKey;

    public QuestionGenerationServiceImplementation(DocumentRepository documentRepository,
                                                   QuestionService questionService,
                                                   AnswerService answerService,
                                                   RestTemplate restTemplate, DocumentService documentService) {
        this.documentRepository = documentRepository;
        this.questionService = questionService;
        this.answerService = answerService;
        this.restTemplate = restTemplate;
        this.objectMapper = new ObjectMapper();
        this.documentService = documentService;
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
        try {
            return callConfiguredAiApi(document, request);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return List.of();
    }

    private List<GeneratedQuestionDto> callConfiguredAiApi(Document document, GenerateQuestionsRequest request) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("Authorization", "Bearer " + apiKey);
        }

        Map<String, Object> requestBody = new HashMap<>();

        if (aiApiUrl.contains("openai.com")) {
            requestBody.put("model", "gpt-3.5-turbo");

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", "You are a helpful assistant that generates educational questions and answers."));
            messages.add(Map.of("role", "user", "content", buildPrompt(document, request)));
            requestBody.put("messages", messages);

            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", 2000);
        } else {
            requestBody.put("prompt", buildPrompt(document, request));
            requestBody.put("max_tokens", 2000);
            requestBody.put("temperature", 0.7);
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(aiApiUrl, entity, Map.class);
        String aiResponse = extractContentFromAiResponse(response.getBody());

        return parseQuestionsFromAiResponse(aiResponse);
    }

    private String buildPrompt(Document document, GenerateQuestionsRequest request) throws IOException {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("Generate ");
        promptBuilder.append(request.getQuestionCount());
        promptBuilder.append(" ");
        promptBuilder.append(request.getDifficultyLevel().toLowerCase());
        promptBuilder.append(" difficulty ");

        promptBuilder.append("questions of the following types: ");
        promptBuilder.append(String.join(", ", request.getQuestionTypes()));

        promptBuilder.append(" based on the following content:\n\n");
        promptBuilder.append(documentService.getDocumentContent(document));

        promptBuilder.append("\n\nFormat your response as a JSON array where each question object contains 'text', 'type', and 'answers' fields.");
        promptBuilder.append(" Each answer should have 'text' and 'isCorrect' fields.");
        promptBuilder.append(" Ensure the response is valid JSON that can be parsed.");
        promptBuilder.append(" For each question type: ");
        promptBuilder.append(" - MULTIPLE_CHOICE should have one correct answer and 2-4 incorrect answers");
        promptBuilder.append(" - TRUE_FALSE should have exactly one answer marked as correct");
        promptBuilder.append(" - FILL_IN_THE_BLANK should provide the correct answers to fill in the blank");
        promptBuilder.append(" The response language should be: ").append(request.getLanguage());

        return promptBuilder.toString();
    }

    private String extractContentFromAiResponse(Map responseBody) {
        try {
            if (responseBody.containsKey("choices")) {
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.getFirst();
                    if (firstChoice.containsKey("message")) {
                        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                        return (String) message.get("content");
                    } else if (firstChoice.containsKey("text")) {
                        return (String) firstChoice.get("text");
                    }
                }
            }

            if (responseBody.containsKey("generated_text")) {
                return (String) responseBody.get("generated_text");
            }

            for (Object key : responseBody.keySet()) {
                Object value = responseBody.get(key);
                if (value instanceof String) {
                    return (String) value;
                }
            }

            return objectMapper.writeValueAsString(responseBody);
        } catch (Exception e) {
            throw new RuntimeException("Error extracting content from AI response", e);
        }
    }

    private List<GeneratedQuestionDto> parseQuestionsFromAiResponse(String aiResponse) {
        List<GeneratedQuestionDto> result = new ArrayList<>();

        try {
            String jsonContent = extractJsonFromText(aiResponse);
            JsonNode jsonArray = objectMapper.readTree(jsonContent);

            if (jsonArray.isArray()) {
                for (JsonNode questionNode : jsonArray) {
                    GeneratedQuestionDto questionDto = new GeneratedQuestionDto();

                    if (questionNode.has("text")) {
                        questionDto.setText(questionNode.get("text").asText());
                    } else if (questionNode.has("question")) {
                        questionDto.setText(questionNode.get("question").asText());
                    } else {
                        continue;
                    }

                    if (questionNode.has("type")) {
                        questionDto.setType(questionNode.get("type").asText());
                    } else {
                        questionDto.setType("MULTIPLE_CHOICE"); // Default type
                    }

                    List<Map<String, Object>> answers = new ArrayList<>();
                    if (questionNode.has("answers") && questionNode.get("answers").isArray()) {
                        for (JsonNode answerNode : questionNode.get("answers")) {
                            Map<String, Object> answerMap = new HashMap<>();

                            if (answerNode.has("text")) {
                                answerMap.put("text", answerNode.get("text").asText());
                            } else if (answerNode.has("answer")) {
                                answerMap.put("text", answerNode.get("answer").asText());
                            } else {
                                continue;
                            }

                            if (answerNode.has("isCorrect")) {
                                answerMap.put("isCorrect", answerNode.get("isCorrect").asBoolean());
                            } else if (answerNode.has("correct")) {
                                answerMap.put("isCorrect", answerNode.get("correct").asBoolean());
                            } else {
                                answerMap.put("isCorrect", false);
                            }

                            answers.add(answerMap);
                        }
                    }

                    questionDto.setAnswers(answers);
                    result.add(questionDto);
                }
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }

        return result;
    }

    private String extractJsonFromText(String text) {
        int startIndex = text.indexOf("[");
        int endIndex = text.lastIndexOf("]");

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return text.substring(startIndex, endIndex + 1);
        }

        startIndex = text.indexOf("{");
        endIndex = text.lastIndexOf("}");

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return text.substring(startIndex, endIndex + 1);
        }

        return "[" + text + "]";
    }
}