package com.example.aiassist.ai.analysis.dto;

public record CodeAnalysisResponse(
        boolean showHint,
        String level,
        String message) {
}
