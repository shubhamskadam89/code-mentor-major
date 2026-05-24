package com.example.aiassist.problem.service;

import com.example.aiassist.problem.dto.Hint;
import com.example.aiassist.core.session.SessionState;
import com.example.aiassist.signal.model.ApproachType;
import com.example.aiassist.signal.model.ValidationResult;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class HintPolicyEngine {

    private static final long COOLDOWN_MS = 30_000; // 30 seconds

    public Optional<Hint> generateHint(
            ValidationResult result,
            ApproachType approach,
            SessionState session
    ) {

        if (result != ValidationResult.WRONG) {
            session.resetMistakes();
            return Optional.empty();
        }

        long now = System.currentTimeMillis();

        // Cooldown check
        if (now - session.getLastHintTimestamp() < COOLDOWN_MS) {
            return Optional.empty();
        }

        // Same mistake?
        if (approach == session.getLastDetectedApproach()) {
            session.incrementMistake();
        } else {
            session.resetMistakes();
        }

        session.setLastDetectedApproach(approach);
        session.setLastHintTimestamp(now);

        // Escalation logic
        if (approach == ApproachType.GREEDY) {
            return Optional.of(
                    session.getSameMistakeCount() >= 2
                            ? new Hint(
                            "DIRECTIONAL",
                            "This problem has overlapping subproblems. Try thinking about reusing results instead of making local choices."
                    )
                            : new Hint(
                            "GENTLE",
                            "Check whether making a locally optimal choice always leads to a globally optimal solution."
                    )
            );
        }

        if (approach == ApproachType.BRUTE_FORCE) {
            return Optional.of(
                    session.getSameMistakeCount() >= 2
                            ? new Hint(
                            "DIRECTIONAL",
                            "Repeated nested scans may not scale. Is there a data structure that can help you look up values faster?"
                    )
                            : new Hint(
                            "GENTLE",
                            "Is there a way to trade extra space for faster lookups?"
                    )
            );
        }

        return Optional.empty();
    }
}
