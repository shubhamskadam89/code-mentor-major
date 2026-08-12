package com.example.aiassist.ai.analysis.service;

import com.example.aiassist.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

@Slf4j
@Service
public class OllamaService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.ollama.url:}")
    private String url;

    @Value("${ai.ollama.model:nemotron-3-super:cloud}")
    private String model;

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

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "prompt", prompt,
                "stream", false
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity =
                new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response =
                    restTemplate.postForEntity(url, entity, Map.class);

            if (response.getBody() == null ||
                !response.getBody().containsKey("response")) {
                throw new BadRequestException("Invalid AI response format");
            }

            Object result = response.getBody().get("response");

            if (result == null) {
                throw new BadRequestException("AI returned empty response");
            }

            return result.toString();

        } catch (Exception e) {
            log.error("[OLLAMA ERROR] Exception details:", e);
            throw new BadRequestException("Failed to communicate with AI service: " + e.getMessage());
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
