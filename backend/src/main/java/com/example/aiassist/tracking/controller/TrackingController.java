package com.example.aiassist.tracking.controller;

import com.example.aiassist.common.response.ApiResponse;
import com.example.aiassist.student.dto.ProblemAttemptResponseDTO;
import com.example.aiassist.student.dto.ProblemTrackingRequest;
import com.example.aiassist.tracking.service.TrackingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tracking")
@CrossOrigin(origins = "*")
public class TrackingController {

    private final TrackingService trackingService;

    public TrackingController(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    @PostMapping("/attempt")
    public ApiResponse<ProblemAttemptResponseDTO> logAttempt(
            @Valid @RequestBody ProblemTrackingRequest request) {

        return ApiResponse.success(
                trackingService.logAttempt(request),
                "Attempt logged successfully"
        );
    }

    @PostMapping("/hint")
    public ApiResponse<ProblemAttemptResponseDTO> logHint(
            @Valid @RequestBody ProblemTrackingRequest request) {

        return ApiResponse.success(
                trackingService.logHintUsage(request),
                "Hint usage logged successfully"
        );
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<ProblemAttemptResponseDTO>> getAttempts(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ApiResponse.success(
                trackingService.getAttemptsByStudent(studentId, page, size)
        );
    }

    @GetMapping("/handle/{handle}")
    public ApiResponse<List<ProblemAttemptResponseDTO>> getAttemptsByHandle(
            @PathVariable String handle,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ApiResponse.success(
                trackingService.getAttemptsByStudentHandle(handle, page, size)
        );
    }
}
