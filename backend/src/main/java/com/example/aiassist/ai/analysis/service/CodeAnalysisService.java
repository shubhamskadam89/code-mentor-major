package com.example.aiassist.ai.analysis.service;

import com.example.aiassist.common.exception.BadRequestException;
import com.example.aiassist.common.exception.ResourceNotFoundException;
import com.example.aiassist.ai.analysis.entity.CodeSnapshot;
import com.example.aiassist.problem.entity.ProblemContext;
import com.example.aiassist.ai.analysis.dto.CodeAnalysisRequest;
import com.example.aiassist.ai.analysis.dto.CodeAnalysisResponse;
import com.example.aiassist.ai.analysis.repository.CodeSnapshotRepository;
import com.example.aiassist.problem.entity.ProblemAttempt;
import com.example.aiassist.problem.repository.ProblemAttemptRepository;
import com.example.aiassist.problem.repository.ProblemContextRepository;
import com.example.aiassist.student.entity.StudentProfile;
import com.example.aiassist.student.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
public class CodeAnalysisService {

    private final ProblemContextRepository contextRepository;
    private final CodeSnapshotRepository snapshotRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final ProblemAttemptRepository attemptRepository;
    private final OllamaService ollamaService;
    private final GeminiService geminiService;
    private final RateLimiterService rateLimiterService;

    @Value("${ai.mode:LLM}")
    private String aiMode;

    @Value("${gemini.api.key:none}")
    private String geminiApiKey;

    public CodeAnalysisService(
            ProblemContextRepository contextRepository,
            CodeSnapshotRepository snapshotRepository,
            StudentProfileRepository studentProfileRepository,
            ProblemAttemptRepository attemptRepository,
            OllamaService ollamaService,
            GeminiService geminiService,
            RateLimiterService rateLimiterService) {
        this.contextRepository = contextRepository;
        this.snapshotRepository = snapshotRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.attemptRepository = attemptRepository;
        this.ollamaService = ollamaService;
        this.geminiService = geminiService;
        this.rateLimiterService = rateLimiterService;
    }

    public CodeAnalysisResponse analyze(CodeAnalysisRequest request) {
        System.out.println("[ANALYZE] Received request: SessionId=" + request.getSessionId() +
                           ", ContextId=" + request.getProblemContextId() +
                           ", Language=" + request.getLanguage());

        // Enforce rate limiting
        String rateLimitId = (request.getHandle() != null && !request.getHandle().isBlank())
                ? request.getHandle()
                : request.getSessionId();
        rateLimiterService.checkRateLimit(rateLimitId);

        ProblemContext context = contextRepository.findById(request.getProblemContextId())
                .orElseThrow(() -> new ResourceNotFoundException("Problem context not found"));

        System.out.println("[ANALYZE] Found Context: Title=" + context.getTitle());

        snapshotRepository.save(new CodeSnapshot(
                request.getSessionId(),
                context,
                request.getLanguage(),
                request.getRawCode()
        ));

        AdaptiveHintContext adaptive = buildAdaptiveContext(request);

        String hint;
        System.out.println("[ANALYZE] Calling AI engine with code length: " + 
                           (request.getRawCode() != null ? request.getRawCode().length() : 0));

        try {
            if ("GEMINI".equalsIgnoreCase(aiMode) || (geminiApiKey != null && !geminiApiKey.equals("none") && !geminiApiKey.isBlank())) {
                System.out.println("[ANALYZE] Routing to Gemini API");
                hint = geminiService.generateHint(
                        context.getDescription(),
                        request.getRawCode(),
                        adaptive.studentLevel(),
                        adaptive.codeStatus(),
                        adaptive.detailLevel(),
                        adaptive.topicWeakness(),
                        adaptive.hintDepth(),
                        adaptive.priorHintsOnProblem()
                );
            } else {
                System.out.println("[ANALYZE] Routing to Ollama API");
                hint = ollamaService.generateHint(
                        context.getDescription(),
                        request.getRawCode(),
                        adaptive.studentLevel(),
                        adaptive.codeStatus(),
                        adaptive.detailLevel(),
                        adaptive.topicWeakness(),
                        adaptive.hintDepth(),
                        adaptive.priorHintsOnProblem()
                );
            }
            System.out.println("[ANALYZE] AI returned hint: " + hint);
        } catch (Exception e) {
            System.err.println("[ANALYZE] AI engine failed: " + e.getMessage());
            throw new BadRequestException("AI engine unavailable");
        }

        if (hint == null || hint.isBlank()) {
            throw new BadRequestException("AI returned empty response");
        }

        boolean showHint = true;
        String level = adaptive.hintLevel();
        String message = hint;

        String trimmed = hint.trim();

        if (trimmed.startsWith("CORRECT:")) {
            showHint = false;
            level = "GREAT_JOB";
            message = trimmed.substring("CORRECT:".length()).trim();
        } else if (trimmed.startsWith("HINT:")) {
            message = trimmed.substring("HINT:".length()).trim();
        }
        message = limitWords(message, 20);

        return new CodeAnalysisResponse(
                showHint,
                level,
                message,
                adaptive.detailLevel(),
                adaptive.reason(),
                adaptive.nextAction(),
                adaptive.hintDepth(),
                adaptive.studentLevel());
    }

    private AdaptiveHintContext buildAdaptiveContext(CodeAnalysisRequest request) {
        String code = request.getRawCode() == null ? "" : request.getRawCode().trim();
        String problemId = request.getProblemId();
        int requestedDepth = request.getHintDepth() == null ? 1 : Math.max(1, Math.min(5, request.getHintDepth()));

        int priorHintsOnProblem = 0;
        String studentLevel = normalizeLevel(request.getStudentLevel());
        String topicWeakness = "unknown";

        if (request.getHandle() != null && !request.getHandle().isBlank()) {
            Optional<StudentProfile> profileOpt = studentProfileRepository.findByHandle(request.getHandle());
            if (profileOpt.isPresent()) {
                StudentProfile profile = profileOpt.get();
                List<ProblemAttempt> attempts = attemptRepository.findByStudentProfileId(profile.getId());
                studentLevel = inferStudentLevel(request.getStudentLevel(), attempts);
                topicWeakness = inferWeakness(attempts);

                if (problemId != null && !problemId.isBlank()) {
                    priorHintsOnProblem = attempts.stream()
                            .filter(a -> problemId.equalsIgnoreCase(a.getProblemId()))
                            .mapToInt(ProblemAttempt::getHintsUsed)
                            .max()
                            .orElse(0);
                }
            }
        }

        int hintDepth = Math.max(requestedDepth, Math.min(5, priorHintsOnProblem + 1));
        String codeStatus = inferCodeStatus(code, priorHintsOnProblem, hintDepth);
        String detailLevel = inferDetailLevel(studentLevel, hintDepth, codeStatus);
        String hintLevel = inferHintLevel(codeStatus, hintDepth);
        String reason = inferReason(codeStatus, priorHintsOnProblem);
        String nextAction = inferNextAction(codeStatus);

        return new AdaptiveHintContext(
                studentLevel,
                codeStatus,
                detailLevel,
                hintLevel,
                reason,
                nextAction,
                topicWeakness,
                hintDepth,
                priorHintsOnProblem);
    }

    private String normalizeLevel(String requestedLevel) {
        if (requestedLevel == null || requestedLevel.isBlank()) return "intermediate";
        String lower = requestedLevel.toLowerCase();
        if (lower.equals("beginner") || lower.equals("intermediate") || lower.equals("expert")) {
            return lower;
        }
        return "intermediate";
    }

    private String inferStudentLevel(String requestedLevel, List<ProblemAttempt> attempts) {
        if (requestedLevel != null && !requestedLevel.isBlank()) return normalizeLevel(requestedLevel);
        if (attempts.isEmpty()) return "beginner";

        long completed = attempts.stream().filter(ProblemAttempt::isCompleted).count();
        int hints = attempts.stream().mapToInt(ProblemAttempt::getHintsUsed).sum();
        double completionRate = completed / (double) attempts.size();
        double hintsPerAttempt = hints / (double) attempts.size();

        if (completionRate >= 0.75 && hintsPerAttempt <= 1.0 && completed >= 10) return "expert";
        if (completionRate < 0.4 || hintsPerAttempt >= 3.0) return "beginner";
        return "intermediate";
    }

    private String inferWeakness(List<ProblemAttempt> attempts) {
        return attempts.stream()
                .filter(a -> a.getHintsUsed() > 0 && a.getDifficulty() != null)
                .max(Comparator.comparingInt(ProblemAttempt::getHintsUsed))
                .map(a -> a.getDifficulty() + " problems")
                .orElse("not enough history");
    }

    private String inferCodeStatus(String code, int priorHintsOnProblem, int hintDepth) {
        if (code.isBlank()) return "NO_CODE";
        if (priorHintsOnProblem >= 3 || hintDepth >= 4) return "REPEATED_STUCK";
        if (priorHintsOnProblem >= 1 || hintDepth >= 2) return "LIKELY_STUCK";
        return "PARTIAL_CODE";
    }

    private String inferDetailLevel(String studentLevel, int hintDepth, String codeStatus) {
        if ("expert".equals(studentLevel) && hintDepth <= 2) return "LOW";
        if ("beginner".equals(studentLevel) || hintDepth >= 3 || "REPEATED_STUCK".equals(codeStatus)) return "HIGH";
        return "MEDIUM";
    }

    private String inferHintLevel(String codeStatus, int hintDepth) {
        if ("NO_CODE".equals(codeStatus)) return "CONCEPTUAL";
        if (hintDepth >= 4) return "PSEUDOCODE";
        if ("LIKELY_STUCK".equals(codeStatus) || "REPEATED_STUCK".equals(codeStatus)) return "DEBUG";
        return "DIRECTIONAL";
    }

    private String inferReason(String codeStatus, int priorHintsOnProblem) {
        if ("NO_CODE".equals(codeStatus)) return "no_code";
        if (priorHintsOnProblem >= 3) return "repeated_stuck";
        if (priorHintsOnProblem > 0) return "student_stuck";
        return "code_guidance";
    }

    private String inferNextAction(String codeStatus) {
        if ("NO_CODE".equals(codeStatus)) return "Choose the core approach before writing code.";
        if ("PARTIAL_CODE".equals(codeStatus)) return "Check whether your current invariant matches the problem goal.";
        if ("LIKELY_STUCK".equals(codeStatus)) return "Revisit the mistaken condition or transition before adding more code.";
        return "Ask for the next hint only after trying the suggested change.";
    }

    private String limitWords(String text, int maxWords) {
        if (text == null || text.isBlank()) return text;
        String[] words = text.trim().split("\\s+");
        if (words.length <= maxWords) return text.trim();
        return String.join(" ", java.util.Arrays.copyOf(words, maxWords)) + "...";
    }

    private record AdaptiveHintContext(
            String studentLevel,
            String codeStatus,
            String detailLevel,
            String hintLevel,
            String reason,
            String nextAction,
            String topicWeakness,
            int hintDepth,
            int priorHintsOnProblem) {
    }
}
