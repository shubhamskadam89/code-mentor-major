package com.example.aiassist.signal.engine;

import com.example.aiassist.signal.model.DetectionResult;
import com.example.aiassist.signal.model.SignalVector;
import com.example.aiassist.signal.model.ApproachType;
import org.springframework.stereotype.Component;

@Component
public class IntentDetectionEngine {

    public DetectionResult detect(SignalVector s) {

        // Dynamic Programming
        if (s.hasDPArray) {
            return new DetectionResult(ApproachType.DP, 0.9);
        }

        // HashMap (explicit lookup intent)
        if (s.usesHashMap && !s.usesSort) {
            return new DetectionResult(ApproachType.HASHMAP, 0.9);
        }

        // Greedy
        if (s.usesSort && !s.hasRecursion && !s.hasDPArray) {
            return new DetectionResult(ApproachType.GREEDY, 0.75);
        }

        // Brute force
        if (s.loopDepth >= 2 && !s.usesSort && !s.hasRecursion) {
            return new DetectionResult(ApproachType.BRUTE_FORCE, 0.8);
        }

        return new DetectionResult(ApproachType.UNKNOWN, 0.3);
    }
}
