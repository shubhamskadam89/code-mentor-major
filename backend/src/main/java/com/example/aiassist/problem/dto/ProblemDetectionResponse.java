package com.example.aiassist.problem.dto;

import com.example.aiassist.signal.model.ApproachType;
import java.util.UUID;

public record ProblemDetectionResponse(
        UUID problemContextId,
        ApproachType expectedOptimal,
        double confidence) {
}
