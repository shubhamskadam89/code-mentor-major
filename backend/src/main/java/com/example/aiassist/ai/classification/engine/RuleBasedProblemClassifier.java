package com.example.aiassist.ai.classification.engine;

import com.example.aiassist.ai.classification.dto.ProblemClassificationResult;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.util.concurrent.CompletableFuture;

@Component("ruleBasedProblemClassifier")
public class RuleBasedProblemClassifier implements AiProblemClassifier {

    @Override
    @Async
    public CompletableFuture<ProblemClassificationResult> classify(String title, String description) {
        // Stub implementation
        return CompletableFuture.completedFuture(new ProblemClassificationResult(null, 0.0, "Rule-based incomplete"));
    }
}
