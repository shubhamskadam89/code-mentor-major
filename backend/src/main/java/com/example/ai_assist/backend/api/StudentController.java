package com.example.ai_assist.backend.api;

import com.example.ai_assist.backend.domain.StudentStats;
import com.example.ai_assist.backend.service.StudentService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "*")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/{studentId}/stats")
    public StudentStats getStats(@PathVariable String studentId) {
        return studentService.getOrCreateStats(studentId);
    }

    @PostMapping("/{studentId}/level")
    public void updateLevel(@PathVariable String studentId, @RequestBody Map<String, String> body) {
        studentService.updateLevel(studentId, body.get("level"));
    }

    @PostMapping("/{studentId}/solved")
    public void markSolved(@PathVariable String studentId, @RequestBody Map<String, Boolean> body) {
        studentService.recordProblemAttempt(studentId, body.getOrDefault("solved", true));
    }
}
