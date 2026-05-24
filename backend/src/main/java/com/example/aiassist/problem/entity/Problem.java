package com.example.aiassist.problem.entity;

import com.example.aiassist.signal.model.ApproachType;
import jakarta.persistence.*;

import java.util.Set;

@Entity
@Table(name = "problem")
public class Problem {

    @Id
    private String problemId;

    @ElementCollection(targetClass = ApproachType.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "problem_valid_approaches", joinColumns = @JoinColumn(name = "problem_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "approach_type")
    private Set<ApproachType> validApproaches;

    @ElementCollection(targetClass = ApproachType.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "problem_invalid_approaches", joinColumns = @JoinColumn(name = "problem_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "approach_type")
    private Set<ApproachType> invalidApproaches;

    public Problem() {
    }

    public Problem(String problemId,
            Set<ApproachType> valid,
            Set<ApproachType> invalid) {
        this.problemId = problemId;
        this.validApproaches = valid;
        this.invalidApproaches = invalid;
    }

    public String getProblemId() {
        return problemId;
    }

    public Set<ApproachType> getValidApproaches() {
        return validApproaches;
    }

    public Set<ApproachType> getInvalidApproaches() {
        return invalidApproaches;
    }
}
