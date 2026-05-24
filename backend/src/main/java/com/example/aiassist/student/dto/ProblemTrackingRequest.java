package com.example.aiassist.student.dto;

import com.example.aiassist.core.platform.Platform;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProblemTrackingRequest {

    @NotBlank(message = "Handle is required")
    private String handle;

    @NotNull(message = "Platform is required")
    private Platform platform;

    @NotBlank(message = "Problem ID is required")
    private String problemId;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    private int hintsUsed;

    private boolean completed;

    private boolean hintOnly;
}
