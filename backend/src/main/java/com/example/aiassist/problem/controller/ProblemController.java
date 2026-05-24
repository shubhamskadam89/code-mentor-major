package com.example.aiassist.problem.controller;

import com.example.aiassist.common.response.ApiResponse;
import com.example.aiassist.problem.dto.*;
import com.example.aiassist.ai.classification.service.ProblemDetectionService;
import com.example.aiassist.problem.service.HintService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/problem")
@CrossOrigin(origins = "*")
public class ProblemController {

    private final ProblemDetectionService detectionService;
    private final HintService hintService;

    public ProblemController(ProblemDetectionService detectionService,
                             HintService hintService) {
        this.detectionService = detectionService;
        this.hintService = hintService;
    }

    @PostMapping("/detect")
    public ApiResponse<ProblemDetectionResponse> detectProblem(
            @Valid @RequestBody ProblemDetectionRequest request) {

        return ApiResponse.success(
                detectionService.detect(request),
                "Problem detected successfully"
        );
    }

    @PostMapping("/hint")
    public ApiResponse<HintResponse> getHint(
            @RequestHeader("Session-Id") String sessionId,
            @Valid @RequestBody HintRequest request) {

        return ApiResponse.success(
                hintService.generateHint(request, sessionId),
                "Hint processed successfully"
        );
    }
}