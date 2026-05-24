package com.example.aiassist.problem.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProblemDetectionRequest {
    @JsonProperty("title")
    @NotBlank(message = "Title is required")
    private String title;
    
    @JsonProperty("description")
    @NotBlank(message = "Description is required")
    private String description;
    
    @JsonProperty("platform")
    @NotBlank(message = "Platform is required")
    private String platform;
    
    @JsonProperty("url")
    private String url;









}
