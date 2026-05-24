package com.example.aiassist.ai.analysis.service;

import com.example.aiassist.common.exception.BadRequestException;
import com.example.aiassist.common.exception.ResourceNotFoundException;
import com.example.aiassist.ai.analysis.entity.CodeSnapshot;
import com.example.aiassist.problem.entity.ProblemContext;
import com.example.aiassist.ai.analysis.dto.CodeAnalysisRequest;
import com.example.aiassist.ai.analysis.dto.CodeAnalysisResponse;
import com.example.aiassist.ai.analysis.repository.CodeSnapshotRepository;
import com.example.aiassist.problem.repository.ProblemContextRepository;
import org.springframework.stereotype.Service;

@Service
public class CodeAnalysisService {

    private final ProblemContextRepository contextRepository;
    private final CodeSnapshotRepository snapshotRepository;
    private final OllamaService ollamaService;

    public CodeAnalysisService(
            ProblemContextRepository contextRepository,
            CodeSnapshotRepository snapshotRepository,
            OllamaService ollamaService) {
        this.contextRepository = contextRepository;
        this.snapshotRepository = snapshotRepository;
        this.ollamaService = ollamaService;
    }

    public CodeAnalysisResponse analyze(CodeAnalysisRequest request) {
        System.out.println("[ANALYZE] Received request: SessionId=" + request.getSessionId() +
                           ", ContextId=" + request.getProblemContextId() +
                           ", Language=" + request.getLanguage());

        ProblemContext context = contextRepository.findById(request.getProblemContextId())
                .orElseThrow(() -> new ResourceNotFoundException("Problem context not found"));

        System.out.println("[ANALYZE] Found Context: Title=" + context.getTitle());

        snapshotRepository.save(new CodeSnapshot(
                request.getSessionId(),
                context,
                request.getLanguage(),
                request.getRawCode()
        ));

        String hint;
        System.out.println("[ANALYZE] Calling Ollama with code length: " + 
                           (request.getRawCode() != null ? request.getRawCode().length() : 0));

        try {
            hint = ollamaService.generateHint(
                    context.getDescription(),
                    request.getRawCode(),
                    request.getStudentLevel() // NEW PARAM
            );
            System.out.println("[ANALYZE] Ollama returned hint: " + hint);
        } catch (Exception e) {
            System.err.println("[ANALYZE] Ollama failed: " + e.getMessage());
            throw new BadRequestException("AI engine unavailable");
        }

        if (hint == null || hint.isBlank()) {
            throw new BadRequestException("AI returned empty response");
        }

        boolean showHint = true;
        String level = "logic";
        String message = hint;

        String trimmed = hint.trim();

        if (trimmed.startsWith("CORRECT:")) {
            showHint = false;
            level = "GREAT_JOB";
            message = trimmed.substring("CORRECT:".length()).trim();
        } else if (trimmed.startsWith("HINT:")) {
            message = trimmed.substring("HINT:".length()).trim();
        }

        return new CodeAnalysisResponse(showHint, level, message);
    }
}