package com.example.aiassist.ai.analysis.service;

import com.example.aiassist.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gemini.api.key:none}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String modelName;

    public String generateHint(
            String problem,
            String code,
            String studentLevel,
            String codeStatus,
            String detailLevel,
            String topicWeakness,
            int hintDepth,
            int priorHintsOnProblem) {

        if (problem == null || problem.isBlank()) {
            throw new BadRequestException("Problem description cannot be empty");
        }

        if (apiKey == null || apiKey.equals("none") || apiKey.isBlank()) {
            throw new BadRequestException("Gemini API key is not configured");
        }

        String level = (studentLevel != null && !studentLevel.isBlank()) ? studentLevel : "intermediate";
        String prompt = buildPrompt(
                problem,
                code == null ? "" : code,
                level,
                codeStatus,
                detailLevel,
                topicWeakness,
                hintDepth,
                priorHintsOnProblem);

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> parts = Map.of("parts", List.of(textPart));
        Map<String, Object> contents = Map.of("contents", List.of(parts));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(contents, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            if (response.getBody() == null) {
                throw new BadRequestException("Empty response from Gemini API");
            }

            List candidates = (List) response.getBody().get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                throw new BadRequestException("No candidates returned from Gemini API");
            }
            Map candidate = (Map) candidates.get(0);
            Map content = (Map) candidate.get("content");
            if (content == null) {
                throw new BadRequestException("No content returned from Gemini API");
            }
            List partsList = (List) content.get("parts");
            if (partsList == null || partsList.isEmpty()) {
                throw new BadRequestException("No parts returned from Gemini API");
            }
            Map part = (Map) partsList.get(0);
            Object textResult = part.get("text");

            if (textResult == null) {
                throw new BadRequestException("Gemini API returned empty text");
            }

            return textResult.toString();

        } catch (Exception e) {
            log.error("[GEMINI ERROR] Exception details:", e);
            throw new BadRequestException("Failed to communicate with Gemini service: " + e.getMessage());
        }
    }

    private String buildPrompt(
            String problem,
            String code,
            String studentLevel,
            String codeStatus,
            String detailLevel,
            String topicWeakness,
            int hintDepth,
            int priorHintsOnProblem) {
        String levelInstructions;
        switch (studentLevel.toLowerCase()) {
            case "beginner" ->
                levelInstructions = "Use simple language and explain the thinking step. You may give a more detailed hint, but do not write code.";
            case "expert" ->
                levelInstructions = "Be concise and technical. Give a one-line nudge, ideally phrased as a question or invariant.";
            default ->
                levelInstructions = "Be clear but not too simple. Reference the relevant pattern or edge case without revealing the full answer.";
        }

        String base = """
                You are CodeMentor, an adaptive Socratic coding tutor. Guide the student, do not solve the problem.

                ABSOLUTE RULES:
                1. NEVER write code.
                2. NEVER give a complete solution.
                3. Give one hint only, maximum 20 words.
                4. Start with "HINT: " always.
                5. Match the hint detail to the student's level and hint depth.
                6. If your hint exceeds 20 words, rewrite it shorter before answering.

                Level instructions: %s
                Code status: %s
                Detail level: %s
                Student weak area: %s
                Prior hints on this problem: %d
                Requested hint depth: %d

                Hint behavior:
                - NO_CODE: give approach-level guidance and the first thing to think about.
                - PARTIAL_CODE: inspect direction and point to the next reasoning step.
                - LIKELY_STUCK: give a more concrete nudge about the mistaken idea or invariant.
                - REPEATED_STUCK: escalate one level, but still avoid code.

                Problem: %s

                Student's current code:
                %s

                Provide a single adaptive hint in 20 words or fewer:
                """;

        return String.format(
                base,
                levelInstructions,
                codeStatus,
                detailLevel,
                topicWeakness,
                priorHintsOnProblem,
                hintDepth,
                problem,
                code.isBlank() ? "(student has not written code yet)" : code);
    }
}
