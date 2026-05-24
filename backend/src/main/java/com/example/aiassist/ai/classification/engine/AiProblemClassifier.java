package com.example.aiassist.ai.classification.engine;

import com.example.aiassist.ai.classification.dto.ProblemClassificationResult;
import java.util.concurrent.CompletableFuture;

public interface AiProblemClassifier {
    CompletableFuture<ProblemClassificationResult> classify(String title, String description);
}
