package com.example.aiassist.classroom.controller;

import com.example.aiassist.classroom.dto.AssignmentRequestDTO;
import com.example.aiassist.classroom.dto.AssignmentResponseDTO;
import com.example.aiassist.classroom.service.AssignmentService;
import com.example.aiassist.common.response.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/assignments")
@CrossOrigin(origins = "*")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @PostMapping
    public ApiResponse<AssignmentResponseDTO> create(@RequestBody AssignmentRequestDTO request) {
        return ApiResponse.success(
                assignmentService.createAssignment(request),
                "Assignment created successfully"
        );
    }

    @GetMapping("/classroom/{classroomId}")
    public ApiResponse<List<AssignmentResponseDTO>> getByClassroom(@PathVariable Long classroomId) {
        return ApiResponse.success(
                assignmentService.getAssignmentsByClassroom(classroomId)
        );
    }

    @GetMapping("/teacher/email/{email}")
    public ApiResponse<List<AssignmentResponseDTO>> getByTeacherEmail(@PathVariable String email) {
        return ApiResponse.success(
                assignmentService.getAssignmentsByTeacherEmail(email)
        );
    }
}
