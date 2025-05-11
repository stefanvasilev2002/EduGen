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
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class QuestionGenerationServiceImplementation implements QuestionGenerationService {
    private static final Logger logger = LoggerFactory.getLogger(QuestionGenerationServiceImplementation.class);

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

    @Value("${ai.generation.model:gpt-3.5-turbo}")
    private String model;

    @Value("${ai.generation.temperature:0.7}")
    private double temperature;

    @Value("${ai.generation.max-tokens:2000}")
    private int maxTokens;

    public QuestionGenerationServiceImplementation(DocumentRepository documentRepository,
                                                   QuestionService questionService,
                                                   AnswerService answerService,
                                                   RestTemplate restTemplate,
                                                   DocumentService documentService) {
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

        if (generatedQuestions.isEmpty()) {
            logger.warn("No questions were generated for document ID: {}", documentId);
            return List.of();
        }

        return saveGeneratedQuestions(documentId, generatedQuestions);
    }

    private List<Question> saveGeneratedQuestions(Long documentId, List<GeneratedQuestionDto> generatedQuestions) {
        List<Question> savedQuestions = new ArrayList<>();

        for (GeneratedQuestionDto generatedQuestion : generatedQuestions) {
            try {
                Question question = questionService.create(
                        documentId,
                        convertToQuestionType(generatedQuestion.getType()),
                        generatedQuestion.getText());

                List<Map<String, Object>> answers = generatedQuestion.getAnswers();
                if (answers != null && !answers.isEmpty()) {
                    for (Map<String, Object> answerData : answers) {
                        String answerText = (String) answerData.get("text");
                        Boolean isCorrect = (Boolean) answerData.getOrDefault("isCorrect", false);

                        if (answerText != null && !answerText.isBlank()) {
                            answerService.create(question.getId(), answerText, isCorrect);
                        }
                    }
                } else {
                    logger.info("Saved question without answers. Question ID: {}, Type: {}",
                            question.getId(), question.getType());
                }

                savedQuestions.add(question);
            } catch (Exception e) {
                logger.error("Error saving generated question: {}", e.getMessage(), e);
            }
        }

        return savedQuestions;
    }
    private QuestionType convertToQuestionType(String type) {
        try {
            return QuestionType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid question type: {}. Defaulting to MULTIPLE_CHOICE", type);
            return QuestionType.MULTIPLE_CHOICE;
        }
    }

    private List<GeneratedQuestionDto> callAiGenerationApi(Document document, GenerateQuestionsRequest request) {
        try {
            return callConfiguredAiApi(document, request);
        } catch (Exception e) {
            logger.error("Error calling AI API: {}", e.getMessage(), e);
            return List.of();
        }
    }

    private List<GeneratedQuestionDto> callConfiguredAiApi(Document document, GenerateQuestionsRequest request) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("Authorization", "Bearer " + apiKey);
        }

        Map<String, Object> requestBody = new HashMap<>();

        if (aiApiUrl.contains("openai.com")) {
            requestBody.put("model", model);

            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", "You are an educational question generator that creates precise, well-formatted JSON output."));
            messages.add(Map.of("role", "user", "content", buildPrompt(document, request)));
            requestBody.put("messages", messages);

            requestBody.put("temperature", temperature);
            requestBody.put("max_tokens", maxTokens);
        } else {
            requestBody.put("prompt", buildPrompt(document, request));
            requestBody.put("max_tokens", maxTokens);
            requestBody.put("temperature", temperature);
        }

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(aiApiUrl, entity, Map.class);

            if (!response.getStatusCode().is2xxSuccessful()) {
                logger.error("AI API returned non-successful status: {}", response.getStatusCode());
                return List.of();
            }

            String aiResponse = extractContentFromAiResponse(response.getBody());
            return parseQuestionsFromAiResponse(aiResponse);
        } catch (Exception e) {
            logger.error("Error in AI API communication: {}", e.getMessage(), e);
            return List.of();
        }
    }

    private String buildPrompt(Document document, GenerateQuestionsRequest request) {
        String documentContent;
        try {
            documentContent = documentService.getDocumentContent(document);
        } catch (Exception e) {
            logger.error("Failed to get document content: {}", e.getMessage(), e);
            documentContent = "Document content unavailable.";
        }

        String language = (request.getLanguage() != null && !request.getLanguage().isEmpty())
                ? request.getLanguage()
                : "English";

        var questionRules = getQuestionRules(request);

        boolean includeAnswers = request.getIncludeAnswers() != null ? request.getIncludeAnswers() : true;

        String jsonExample;
        if (includeAnswers) {
            jsonExample = """
            [
              {
                "text": "The question text",
                "type": "%s",
                "answers": [
                  {"text": "Answer option", "isCorrect": true/false}
                ]
              }
            ]
            """;
        } else {
            jsonExample = """
            [
              {
                "text": "The question text",
                "type": "%s"
              }
            ]
            """;
        }

        return String.format("""
        You are an expert in educational content creation, specializing in generating assessment questions.
        
        TASK:
        Generate %d %s-level questions in %s language based on the educational content below.
        
        QUESTION TYPES:
        %s
        
        RULES FOR QUESTION TYPES:
        %s
        OUTPUT FORMAT:
        Return ONLY a valid JSON array with this structure:
        %s
        
        %s
        
        No explanations or additional text - only the JSON array.
        
        EDUCATIONAL CONTENT:
        %s
        """,
                request.getQuestionCount(),
                request.getDifficultyLevel().toLowerCase(),
                language,
                String.join(", ", request.getQuestionTypes()),
                questionRules,
                String.format(jsonExample, String.join(" or ", request.getQuestionTypes())),
                includeAnswers ? "Each question must include answers with correctness indicated." : "Do not include answer options for any questions.",
                documentContent
        );
    }

    private static StringBuilder getQuestionRules(GenerateQuestionsRequest request) {
        StringBuilder questionRules = new StringBuilder();
        if (request.getQuestionTypes().contains("MULTIPLE_CHOICE")) {
            questionRules.append("- MULTIPLE_CHOICE: each question must have 1-3 correct answers and 2-3 incorrect answers\n");
        }
        if (request.getQuestionTypes().contains("TRUE_FALSE")) {
            questionRules.append("- TRUE_FALSE: each question must be a statement that is either true or false, with exactly one answer marked accordingly\n");
        }
        if (request.getQuestionTypes().contains("FILL_IN_THE_BLANK")) {
            questionRules.append("- FILL_IN_THE_BLANK: present a sentence with a blank space, and provide the correct answer(s) to fill in\n");
        }
        return questionRules;
    }

    private String extractContentFromAiResponse(Map responseBody) {
        try {
            if (responseBody == null) {
                return "{}";
            }

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
            logger.error("Error extracting content from AI response: {}", e.getMessage(), e);
            return "{}";
        }
    }

    private List<GeneratedQuestionDto> parseQuestionsFromAiResponse(String aiResponse) {
        try {
            String jsonContent = extractJsonFromText(aiResponse);

            JsonNode jsonNode = objectMapper.readTree(jsonContent);

            JsonNode jsonArray;
            if (jsonNode.isArray()) {
                jsonArray = jsonNode;
            } else if (jsonNode.isObject()) {
                ArrayNode arrayNode = objectMapper.createArrayNode();
                arrayNode.add(jsonNode);
                jsonArray = arrayNode;
            } else {
                logger.warn("Unable to parse AI response as JSON: {}", jsonContent);
                return List.of();
            }

            List<GeneratedQuestionDto> questions = StreamSupport.stream(jsonArray.spliterator(), false)
                    .map(this::convertJsonNodeToQuestionDto)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            long questionsWithoutAnswers = questions.stream()
                    .filter(q -> q.getAnswers() == null || q.getAnswers().isEmpty())
                    .count();

            if (questionsWithoutAnswers > 0) {
                logger.info("Generated {} questions without answers", questionsWithoutAnswers);
            }

            return questions;
        } catch (Exception e) {
            logger.error("Error parsing AI response: {}", e.getMessage(), e);
            return List.of();
        }
    }
    private GeneratedQuestionDto convertJsonNodeToQuestionDto(JsonNode questionNode) {
        try {
            GeneratedQuestionDto questionDto = new GeneratedQuestionDto();

            String questionText = null;
            if (questionNode.has("text")) {
                questionText = questionNode.get("text").asText();
            } else if (questionNode.has("question")) {
                questionText = questionNode.get("question").asText();
            }

            if (questionText == null || questionText.isBlank()) {
                return null;
            }

            questionDto.setText(questionText);

            String type = "MULTIPLE_CHOICE";
            if (questionNode.has("type")) {
                type = questionNode.get("type").asText();
            }
            questionDto.setType(type);

            List<Map<String, Object>> answers = new ArrayList<>();
            JsonNode answersNode = questionNode.get("answers");
            if (answersNode != null && answersNode.isArray()) {
                for (JsonNode answerNode : answersNode) {
                    Map<String, Object> answerMap = new HashMap<>();

                    String answerText = null;
                    if (answerNode.has("text")) {
                        answerText = answerNode.get("text").asText();
                    } else if (answerNode.has("answer")) {
                        answerText = answerNode.get("answer").asText();
                    }

                    if (answerText == null || answerText.isBlank()) {
                        continue;
                    }

                    answerMap.put("text", answerText);

                    boolean isCorrect = false;
                    if (answerNode.has("isCorrect")) {
                        isCorrect = answerNode.get("isCorrect").asBoolean();
                    } else if (answerNode.has("correct")) {
                        isCorrect = answerNode.get("correct").asBoolean();
                    }

                    answerMap.put("isCorrect", isCorrect);
                    answers.add(answerMap);
                }
            }

            questionDto.setAnswers(answers);
            return questionDto;
        } catch (Exception e) {
            logger.error("Error converting JSON node to QuestionDto: {}", e.getMessage(), e);
            return null;
        }
    }
    private String extractJsonFromText(String text) {
        if (text == null || text.isBlank()) {
            return "[]";
        }

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

        logger.warn("Could not identify JSON structure in AI response, using fallback parsing");
        return "[" + text + "]";
    }

    /**
     * Utility method for handling large documents by breaking them into chunks
     * Note: This is not used in the current implementation but could be helpful
     * for processing very large documents
     */
    private List<String> chunkDocumentContent(String content, int maxChunkSize) {
        if (content == null || content.length() <= maxChunkSize) {
            return Collections.singletonList(content);
        }

        List<String> chunks = new ArrayList<>();
        int length = content.length();

        for (int i = 0; i < length; i += maxChunkSize) {
            chunks.add(content.substring(i, Math.min(length, i + maxChunkSize)));
        }

        return chunks;
    }
}