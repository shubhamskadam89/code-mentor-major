package com.example.aiassist.ai.analysis.controller;

import com.example.aiassist.common.response.ApiResponse;
import com.example.aiassist.ai.analysis.dto.CodeAnalysisRequest;
import com.example.aiassist.ai.analysis.dto.CodeAnalysisResponse;
import com.example.aiassist.ai.analysis.service.CodeAnalysisService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/code")
@CrossOrigin(origins = "*")
public class CodeController {

    private final CodeAnalysisService service;

    public CodeController(CodeAnalysisService service) {
        this.service = service;
    }

    @PostMapping("/analyze")
    public ApiResponse<CodeAnalysisResponse> analyze(
            @Valid @RequestBody CodeAnalysisRequest request) {

        return ApiResponse.success(
                service.analyze(request),
                "Code analyzed successfully"
        );
    }
}