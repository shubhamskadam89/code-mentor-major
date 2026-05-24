package com.example.aiassist.ai.analysis.dto;

import com.example.aiassist.signal.model.SignalVector;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeAnalysisRequest {
    @JsonProperty("sessionId")
    @NotBlank(message = "Session ID is required")
    private String sessionId;

    
    @JsonProperty("problemContextId")
    @NotNull(message = "Problem context ID is required")
    private UUID problemContextId;
    
    @JsonProperty("language")
    @NotBlank(message = "Language is required")
    private String language;
    
    @JsonProperty("rawCode")
    private String rawCode;
    
    @JsonProperty("signalVector")
    @NotNull(message = "Signal vector is required")
    private SignalVector signalVector;

    @JsonProperty("studentLevel")
    private String studentLevel;

    @JsonProperty("handle")
    private String handle;

    @JsonProperty("problemId")
    private String problemId;

    @JsonProperty("hintDepth")
    private Integer hintDepth;
}
