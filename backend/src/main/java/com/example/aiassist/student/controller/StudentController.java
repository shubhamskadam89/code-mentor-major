package com.example.aiassist.student.controller;

import com.example.aiassist.common.response.ApiResponse;
import com.example.aiassist.student.dto.StudentProfileResponse;
import com.example.aiassist.student.dto.StudentProfileUpdateRequest;
import com.example.aiassist.student.service.StudentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/handle/{handle}")
    public ApiResponse<StudentProfileResponse> getProfile(@PathVariable String handle) {
        return ApiResponse.success(
                studentService.getProfileByHandle(handle)
        );
    }

    @PutMapping("/handle/{handle}")
    public ApiResponse<StudentProfileResponse> updateProfile(
            @PathVariable String handle,
            @RequestBody StudentProfileUpdateRequest request) {
        return ApiResponse.success(
                studentService.updateProfileByHandle(handle, request),
                "Profile updated successfully"
        );
    }
}
