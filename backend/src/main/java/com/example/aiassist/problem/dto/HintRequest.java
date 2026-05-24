package com.example.aiassist.problem.dto;

import jakarta.validation.constraints.NotNull;
import com.example.aiassist.signal.model.ApproachType;
import com.example.aiassist.signal.model.ValidationResult;

public class HintRequest {

    @NotNull(message = "Validation result is required")
    private ValidationResult validationResult;

    @NotNull(message = "Approach type is required")
    private ApproachType detectedApproach;

    public ValidationResult getValidationResult() {
        return validationResult;
    }

    public void setValidationResult(ValidationResult validationResult) {
        this.validationResult = validationResult;
    }

    public ApproachType getDetectedApproach() {
        return detectedApproach;
    }

    public void setDetectedApproach(ApproachType detectedApproach) {
        this.detectedApproach = detectedApproach;
    }
}