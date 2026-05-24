package com.example.aiassist.problem.entity;

import com.example.aiassist.core.platform.Platform;
import com.example.aiassist.student.entity.StudentProfile;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "problem_attempt")
public class ProblemAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform;

    @Column(name = "problem_id", nullable = false)
    private String problemId; // e.g., "two-sum"

    @Column(name = "difficulty")
    private String difficulty; // "Easy", "Medium", "Hard"

    @Column(name = "hints_used")
    private int hintsUsed;

    @Column(name = "completed")
    private boolean completed;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    public ProblemAttempt() {
    }

    public ProblemAttempt(StudentProfile studentProfile, Platform platform, String problemId, String difficulty,
            int hintsUsed, boolean completed, LocalDateTime timestamp) {
        this.studentProfile = studentProfile;
        this.platform = platform;
        this.problemId = problemId;
        this.difficulty = difficulty;
        this.hintsUsed = hintsUsed;
        this.completed = completed;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StudentProfile getStudentProfile() {
        return studentProfile;
    }

    public void setStudentProfile(StudentProfile studentProfile) {
        this.studentProfile = studentProfile;
    }

    public Platform getPlatform() {
        return platform;
    }

    public void setPlatform(Platform platform) {
        this.platform = platform;
    }

    public String getProblemId() {
        return problemId;
    }

    public void setProblemId(String problemId) {
        this.problemId = problemId;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public int getHintsUsed() {
        return hintsUsed;
    }

    public void setHintsUsed(int hintsUsed) {
        this.hintsUsed = hintsUsed;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
