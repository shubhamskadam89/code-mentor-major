package com.example.aiassist.student.dto;

import com.example.aiassist.core.platform.Platform;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ProblemAttemptResponseDTO {

    private Long id;
    private String handle;
    private Platform platform;
    private String problemId;
    private String difficulty;
    private int hintsUsed;
    private boolean completed;
    private boolean struggling;
    private LocalDateTime timestamp;

    public ProblemAttemptResponseDTO(
            Long id,
            String handle,
            Platform platform,
            String problemId,
            String difficulty,
            int hintsUsed,
            boolean completed,
            boolean struggling,
            LocalDateTime timestamp) {

        this.id = id;
        this.handle = handle;
        this.platform = platform;
        this.problemId = problemId;
        this.difficulty = difficulty;
        this.hintsUsed = hintsUsed;
        this.completed = completed;
        this.struggling = struggling;
        this.timestamp = timestamp;
    }


}
