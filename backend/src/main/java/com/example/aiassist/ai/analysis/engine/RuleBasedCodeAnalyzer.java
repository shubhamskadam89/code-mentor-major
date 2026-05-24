package com.example.aiassist.ai.analysis.engine;

import com.example.aiassist.ai.analysis.dto.CodeAnalysisResult;
import com.example.aiassist.signal.model.DetectionResult;
import com.example.aiassist.signal.model.SignalVector;
import com.example.aiassist.signal.engine.IntentDetectionEngine;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.Future;

@Component("ruleBasedCodeAnalyzer")
public class RuleBasedCodeAnalyzer implements AiCodeAnalyzer {

    private final IntentDetectionEngine engine;

    public RuleBasedCodeAnalyzer(IntentDetectionEngine engine) {
        this.engine = engine;
    }

    @Override
    @Async
    public Future<CodeAnalysisResult> analyze(String language, String rawCode, SignalVector signalVectorFallback) {
        // Fallback to old engine
        DetectionResult result = engine.detect(signalVectorFallback);
        return new AsyncResult<>(new CodeAnalysisResult(result.getApproach(), result.getConfidence()));
    }
}
