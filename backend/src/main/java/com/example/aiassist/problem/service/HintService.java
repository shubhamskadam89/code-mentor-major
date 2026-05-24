package com.example.aiassist.problem.service;

import com.example.aiassist.problem.dto.*;
import com.example.aiassist.core.session.SessionManager;
import com.example.aiassist.core.session.SessionState;
import org.springframework.stereotype.Service;

@Service
public class HintService {

    private final HintPolicyEngine hintPolicyEngine;
    private final SessionManager sessionManager;

    public HintService(HintPolicyEngine hintPolicyEngine,
                       SessionManager sessionManager) {
        this.hintPolicyEngine = hintPolicyEngine;
        this.sessionManager = sessionManager;
    }

    public HintResponse generateHint(HintRequest request, String sessionId) {

        SessionState session = sessionManager.getSession(sessionId);

        return hintPolicyEngine
                .generateHint(
                        request.getValidationResult(),
                        request.getDetectedApproach(),
                        session
                )
                .map(HintResponse::from)
                .orElse(HintResponse.noHint());
    }
}