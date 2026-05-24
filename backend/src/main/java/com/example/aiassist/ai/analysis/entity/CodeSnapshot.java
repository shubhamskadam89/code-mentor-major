package com.example.aiassist.ai.analysis.entity;

import jakarta.persistence.*;
import java.util.UUID;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.example.aiassist.problem.entity.ProblemContext;

@Entity
@Table(name = "code_snapshot", indexes = {
        @Index(name = "idx_snapshot_session", columnList = "sessionId"),
        @Index(name = "idx_snapshot_problem", columnList = "problemContext_id")
})
@Data
@NoArgsConstructor
public class CodeSnapshot {

    @Id
    @GeneratedValue
    private UUID id;

    private String sessionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problemContext_id")
    private ProblemContext problemContext;

    private String language;

    @Column(columnDefinition = "TEXT")
    private String rawCode;

    private long createdAt;

    public CodeSnapshot(String sessionId,
            ProblemContext problemContext,
            String language,
            String rawCode) {
        this.sessionId = sessionId;
        this.problemContext = problemContext;
        this.language = language;
        this.rawCode = rawCode;
        this.createdAt = System.currentTimeMillis();
    }
}
