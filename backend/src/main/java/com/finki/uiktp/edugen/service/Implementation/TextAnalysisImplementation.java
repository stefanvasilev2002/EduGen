package com.finki.uiktp.edugen.service.Implementation;

import com.finki.uiktp.edugen.model.Answer;
import com.finki.uiktp.edugen.model.Question;
import com.finki.uiktp.edugen.service.TextAnalysis;
import org.json.JSONObject;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import io.github.cdimascio.dotenv.Dotenv;

import java.io.*;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class TextAnalysisImplementation implements TextAnalysis {

    private static final Logger logger = LoggerFactory.getLogger(TextAnalysisImplementation.class);

    private static final Dotenv dotenv = Dotenv.load();

    private static final String OPENAI_API_KEY = dotenv.get("OPENAI_API_KEY");
    private static final String OPENAI_API_URL = "https://api.openrouter.ai/v1/completions";

    @Override
    public String cleanText(String text) {
        return text.replaceAll("\\s+", " ").trim();
    }

    @Override
    public List<Question> generateQuestions(String text) {
        List<Question> questions = new ArrayList<>();
        String prompt = "Generate questions from the following text: " + text;
        String response = callOpenAI(prompt);

        // Assuming response from OpenAI is a list of questions separated by newlines
        String[] questionStrings = response.split("\n");
        for (String questionString : questionStrings) {
            Question question = new Question();
            question.setText(questionString);
            questions.add(question);
        }
        return questions;
    }

    @Override
    public List<Answer> generateAnswers(String text, List<Question> questions) {
        List<Answer> answers = new ArrayList<>();
        for (Question question : questions) {
            String prompt = "Generate an answer for the following question based on the text: " + question.getText() + "\n\nText: " + text;
            String response = callOpenAI(prompt);

            Answer answer = new Answer();
            answer.setText(response); // Map response to Answer object
            answers.add(answer);
        }
        return answers;
    }

    @Override
    public String extractTextFromDocument(Object document) {
        if (document instanceof String) {
            return extractTextFromTextFile((String) document);
        } else if (document instanceof InputStream) {
            return extractTextFromDocx((InputStream) document);
        }
        return "";
    }

    private String extractTextFromTextFile(String filePath) {
        StringBuilder text = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                text.append(line).append("\n");
            }
        } catch (IOException e) {
            logger.error("Error reading text file at path: {}", filePath, e);
        }
        return text.toString();
    }

    private String extractTextFromDocx(InputStream docxInputStream) {
        StringBuilder text = new StringBuilder();
        try {
            XWPFDocument doc = new XWPFDocument(docxInputStream);
            doc.getParagraphs().forEach(paragraph -> text.append(paragraph.getText()).append("\n"));
        } catch (IOException e) {
            logger.error("Error reading .docx file", e);
        }
        return text.toString();
    }

    private String callOpenAI(String prompt) {
        try {
            URI uri = new URI(OPENAI_API_URL);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(uri)
                    .header("Authorization", "Bearer " + OPENAI_API_KEY)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(createRequestBody(prompt), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            // Parse the JSON response using org.json
            JSONObject jsonResponse = new JSONObject(response.body());
            return jsonResponse.getJSONArray("choices").getJSONObject(0).getString("text");

        } catch (Exception e) {
            logger.error("Error calling OpenAI API", e);
            return "";
        }
    }

    private String createRequestBody(String prompt) {
        JSONObject json = new JSONObject();
        json.put("model", "gpt-3.5-turbo"); // Example model
        json.put("prompt", prompt);
        json.put("max_tokens", 150);
        return json.toString();
    }
}
