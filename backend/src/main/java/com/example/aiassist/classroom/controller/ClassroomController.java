package com.example.aiassist.classroom.controller;

import com.example.aiassist.classroom.dto.ClassroomRequestDTO;
import com.example.aiassist.classroom.dto.ClassroomResponseDTO;
import com.example.aiassist.classroom.dto.JoinClassroomDTO;
import com.example.aiassist.classroom.service.ClassroomService;
import com.example.aiassist.common.response.ApiResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/classrooms")
@CrossOrigin(origins = "*")
public class ClassroomController {

    private final ClassroomService classroomService;

    public ClassroomController(ClassroomService classroomService) {
        this.classroomService = classroomService;
    }

    @PostMapping
    public ApiResponse<ClassroomResponseDTO> create(@RequestBody ClassroomRequestDTO request) {
        return ApiResponse.success(
                classroomService.createClassroom(request),
                "Classroom created successfully"
        );
    }

    @PostMapping("/join")
    public ApiResponse<ClassroomResponseDTO> join(@RequestBody JoinClassroomDTO request) {
        return ApiResponse.success(
                classroomService.joinClassroom(request),
                "Joined classroom successfully"
        );
    }

    @PostMapping("/join-by-handle")
    public ApiResponse<ClassroomResponseDTO> joinByHandle(@RequestBody Map<String, String> request) {
        String handle = request.get("handle");
        String joinCode = request.get("joinCode");
        return ApiResponse.success(
                classroomService.joinClassroomByHandle(handle, joinCode),
                "Joined classroom successfully"
        );
    }

    @GetMapping("/teacher/{teacherId}")
    public ApiResponse<List<ClassroomResponseDTO>> byTeacher(
            @PathVariable Long teacherId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        return ApiResponse.success(
                classroomService.getClassroomsByTeacher(teacherId, page, size)
        );
    }

    @GetMapping("/student/{studentId}")
    public ApiResponse<List<ClassroomResponseDTO>> byStudent(
            @PathVariable Long studentId) {

        return ApiResponse.success(
                classroomService.getClassroomsByStudent(studentId)
        );
    }

    @GetMapping("/teacher/email/{email}")
    public ApiResponse<List<ClassroomResponseDTO>> byTeacherEmail(
            @PathVariable String email) {

        return ApiResponse.success(
                classroomService.getClassroomsByTeacherEmail(email)
        );
    }
}