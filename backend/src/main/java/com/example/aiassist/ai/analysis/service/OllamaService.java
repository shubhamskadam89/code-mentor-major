package com.example.aiassist.ai.analysis.service;

import com.example.aiassist.common.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

@Service
public class OllamaService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${ai.ollama.url:http://localhost:11434/api/generate}")
    private String url;

    @Value("${ai.ollama.model:nemotron-3-super:cloud}")
    private String model;

    public String generateHint(String problem, String code, String studentLevel) {

        if (problem == null || problem.isBlank()) {
            throw new BadRequestException("Problem description cannot be empty");
        }

        if (code == null || code.isBlank()) {
            throw new BadRequestException("Code cannot be empty");
        }

        String level = (studentLevel != null && !studentLevel.isBlank()) ? studentLevel : "intermediate";
        String prompt = buildPrompt(problem, code, level);

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
            System.err.println("[OLLAMA ERROR] Exception details:");
            e.printStackTrace();
            throw new BadRequestException("Failed to communicate with AI service: " + e.getMessage());
        }
    }

    private String buildPrompt(String problem, String code, String studentLevel) {
        String levelInstructions;
        switch (studentLevel.toLowerCase()) {
            case "beginner" ->
                levelInstructions = "Use very simple language, avoid jargon. Give a tiny nudge like 'Try thinking about what data structure helps with fast lookups.'";
            case "expert" ->
                levelInstructions = "Be concise and technical. You may reference algorithms, complexity or patterns directly (e.g. 'Consider amortized O(1) via two-stack approach').";
            default ->
                levelInstructions = "Be clear but not too simple. Reference general concepts like loops, recursion, or edge cases without revealing the answer.";
        }

        String base = """
                You are a strict Socratic coding mentor. Your job is to guide the student, NOT solve the problem.

                ABSOLUTE RULES:
                1. NEVER write code.
                2. NEVER give the direct answer or solution logic.
                3. Give ONLY ONE short hint sentence (max 2 lines).
                4. Ask the student a guiding question or point out what to think about.
                5. Start with "HINT: " always.

                Level instructions: %s

                Problem: %s

                Student's current code:
                %s

                Provide a single guiding hint:
                """;

        return String.format(base, levelInstructions, problem, code);
    }
}
