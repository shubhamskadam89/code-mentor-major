package com.example.aiassist.ai.analysis.dto;

import com.example.aiassist.signal.model.ApproachType;

public class CodeAnalysisResult {

    private final ApproachType detectedApproach;
    private final double confidence;

    public CodeAnalysisResult(
            ApproachType detectedApproach,
            double confidence) {
        this.detectedApproach = detectedApproach;
        this.confidence = confidence;
    }

    public ApproachType getDetectedApproach() {
        return detectedApproach;
    }

    public double getConfidence() {
        return confidence;
    }
}
