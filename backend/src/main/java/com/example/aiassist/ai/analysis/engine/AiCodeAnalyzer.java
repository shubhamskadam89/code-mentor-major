package com.example.aiassist.ai.analysis.engine;

import com.example.aiassist.ai.analysis.dto.CodeAnalysisResult;
import com.example.aiassist.signal.model.SignalVector;
import java.util.concurrent.Future;

public interface AiCodeAnalyzer {
    Future<CodeAnalysisResult> analyze(String language, String rawCode, SignalVector signalVectorFallback);
}
