package com.example.aiassist.classroom.service;

import com.example.aiassist.classroom.dto.AssignmentRequestDTO;
import com.example.aiassist.classroom.dto.AssignmentResponseDTO;
import com.example.aiassist.classroom.entity.Assignment;
import com.example.aiassist.classroom.entity.Classroom;
import com.example.aiassist.classroom.repository.AssignmentRepository;
import com.example.aiassist.classroom.repository.ClassroomRepository;
import com.example.aiassist.common.exception.ResourceNotFoundException;
import com.example.aiassist.teacher.entity.Teacher;
import com.example.aiassist.teacher.repository.TeacherRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final ClassroomRepository classroomRepository;
    private final TeacherRepository teacherRepository;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             ClassroomRepository classroomRepository,
                             TeacherRepository teacherRepository) {
        this.assignmentRepository = assignmentRepository;
        this.classroomRepository = classroomRepository;
        this.teacherRepository = teacherRepository;
    }

    public AssignmentResponseDTO createAssignment(AssignmentRequestDTO request) {
        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        Assignment assignment = new Assignment();
        assignment.setClassroom(classroom);
        assignment.setTitle(request.getTitle());
        assignment.setDescription(request.getDescription());
        assignment.setCategory(request.getCategory());
        assignment.setTotalMarks(request.getTotalMarks());
        assignment.setCreatedAt(LocalDateTime.now());
        assignment.setDueDate(request.getDueDate());
        assignment.setProblems(request.getProblems());

        Assignment saved = assignmentRepository.save(assignment);
        return mapToResponse(saved);
    }

    public List<AssignmentResponseDTO> getAssignmentsByClassroom(Long classroomId) {
        classroomRepository.findById(classroomId)
                .orElseThrow(() -> new ResourceNotFoundException("Classroom not found"));

        return assignmentRepository.findByClassroomId(classroomId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<AssignmentResponseDTO> getAssignmentsByTeacherEmail(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        List<Classroom> classrooms = classroomRepository.findByTeacherId(teacher.getId(), PageRequest.of(0, 1000)).getContent();
        List<Long> classroomIds = classrooms.stream().map(Classroom::getId).toList();
        if (classroomIds.isEmpty()) {
            return List.of();
        }
        return assignmentRepository.findByClassroomIdIn(classroomIds)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private AssignmentResponseDTO mapToResponse(Assignment assignment) {
        return new AssignmentResponseDTO(
                assignment.getId(),
                assignment.getClassroom().getId(),
                assignment.getClassroom().getName(),
                assignment.getTitle(),
                assignment.getDescription(),
                assignment.getCategory(),
                assignment.getTotalMarks(),
                assignment.getCreatedAt(),
                assignment.getDueDate(),
                assignment.getProblems()
        );
    }
}
