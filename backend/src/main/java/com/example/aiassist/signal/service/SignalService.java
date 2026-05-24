package com.example.aiassist.signal.service;

import com.example.aiassist.problem.dto.HintResponse;
import com.example.aiassist.signal.model.SignalRequest;
import org.springframework.stereotype.Service;

@Service
public class SignalService {

    public HintResponse handleSignal(SignalRequest req) {

        HintResponse response = new HintResponse();

        response.showHint = true;
        response.level = "MEDIUM";
        response.message = "DP pattern detected. Consider using bottom-up approach.";

        return response;
    }
}
