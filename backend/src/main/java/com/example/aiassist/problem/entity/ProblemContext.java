package com.example.aiassist.problem.entity;

import jakarta.persistence.*;
import java.util.UUID;
import com.example.aiassist.signal.model.ApproachType;
import com.example.aiassist.ai.classification.dto.ClassificationStatus;

@Entity
@Table(name = "problem_context", indexes = {
        @Index(name = "idx_problem_url", columnList = "url"),
        @Index(name = "idx_problem_created_at", columnList = "createdAt")
})
public class ProblemContext {

    @Id
    @GeneratedValue
    private UUID id;

    private String platform;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String url;

    @Enumerated(EnumType.STRING)
    private ApproachType expectedOptimal; // NULL until AI fills

    @Enumerated(EnumType.STRING)
    private ClassificationStatus status = ClassificationStatus.PENDING;

    private double classificationConfidence;

    private long createdAt;

    protected ProblemContext() {
    }

    public ProblemContext(String platform, String title, String description, String url) {
        this.platform = platform;
        this.title = title;
        this.description = description;
        this.url = url;
        this.createdAt = System.currentTimeMillis();
        this.status = ClassificationStatus.PENDING;
    }

    public UUID getId() {
        return id;
    }

    public String getPlatform() {
        return platform;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getUrl() {
        return url;
    }

    public ApproachType getExpectedOptimal() {
        return expectedOptimal;
    }

    public double getClassificationConfidence() {
        return classificationConfidence;
    }

    public long getCreatedAt() {
        return createdAt;
    }

    public ClassificationStatus getStatus() {
        return status;
    }

    public void setExpectedOptimal(ApproachType expectedOptimal) {
        this.expectedOptimal = expectedOptimal;
    }

    public void setClassificationConfidence(double classificationConfidence) {
        this.classificationConfidence = classificationConfidence;
    }

    public void setStatus(ClassificationStatus status) {
        this.status = status;
    }
}
