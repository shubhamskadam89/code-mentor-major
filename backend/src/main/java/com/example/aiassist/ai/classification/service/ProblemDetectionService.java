package com.example.aiassist.ai.classification.service;

import com.example.aiassist.ai.classification.engine.AiProblemClassifier;
import com.example.aiassist.ai.classification.dto.ProblemClassificationResult;
import com.example.aiassist.problem.entity.ProblemContext;
import com.example.aiassist.ai.classification.dto.ClassificationStatus;
import com.example.aiassist.problem.dto.ProblemDetectionRequest;
import com.example.aiassist.problem.dto.ProblemDetectionResponse;
import com.example.aiassist.problem.repository.ProblemContextRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class ProblemDetectionService {

    private final ProblemContextRepository repository;
    private final AiProblemClassifier classifier;

    public ProblemDetectionService(ProblemContextRepository repository,
            AiProblemClassifier classifier) {
        this.repository = repository;
        this.classifier = classifier;
    }

    public ProblemDetectionResponse detect(ProblemDetectionRequest request) {

        System.out.println("[DETECT] Received request: Title=" + request.getTitle() + 
                           ", Platform=" + request.getPlatform() + 
                           ", URL=" + request.getUrl());
        System.out.println("[DETECT] Description (first 100 chars): " + 
                           (request.getDescription() != null && request.getDescription().length() > 100 ? 
                            request.getDescription().substring(0, 100) : request.getDescription()));

        ProblemContext context = new ProblemContext(
                request.getPlatform(),
                request.getTitle(),
                request.getDescription(),
                request.getUrl());

        repository.save(context);

        // Trigger async classification
        processClassification(context.getId(), request.getTitle(), request.getDescription());

        // Return immediately with PENDING status
        return new ProblemDetectionResponse(
                context.getId(),
                null,
                0.0);
    }

   @Async
public void processClassification(UUID contextId, String title, String description) {
    classifier.classify(title, description)
            .thenAccept(result -> {
                repository.findById(contextId).ifPresent(ctx -> {
                    ctx.setExpectedOptimal(result.getExpectedOptimal());
                    ctx.setClassificationConfidence(result.getConfidence());
                    ctx.setStatus(ClassificationStatus.COMPLETED);
                    repository.save(ctx);
                });
            })
            .exceptionally(ex -> {
                repository.findById(contextId).ifPresent(ctx -> {
                    ctx.setStatus(ClassificationStatus.FAILED);
                    repository.save(ctx);
                });
                return null;
            });
}

}
