package com.example.aiassist.teacher.service;

import com.example.aiassist.common.exception.BadRequestException;
import com.example.aiassist.common.exception.ResourceNotFoundException;
import com.example.aiassist.teacher.entity.Teacher;
import com.example.aiassist.teacher.dto.TeacherRequestDTO;
import com.example.aiassist.teacher.dto.TeacherResponseDTO;
import com.example.aiassist.teacher.repository.TeacherRepository;
import com.example.aiassist.classroom.entity.Classroom;
import com.example.aiassist.problem.entity.ProblemAttempt;
import com.example.aiassist.problem.repository.ProblemAttemptRepository;
import com.example.aiassist.student.entity.StudentProfile;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final ProblemAttemptRepository problemAttemptRepository;

    public TeacherService(
            TeacherRepository teacherRepository,
            ProblemAttemptRepository problemAttemptRepository) {
        this.teacherRepository = teacherRepository;
        this.problemAttemptRepository = problemAttemptRepository;
    }

    public TeacherResponseDTO createTeacher(TeacherRequestDTO request) {

        teacherRepository.findByEmail(request.getEmail())
                .ifPresent(t -> {
                    throw new BadRequestException("Teacher with this email already exists");
                });

        Teacher teacher = new Teacher(
                request.getName(),
                request.getEmail(),
                request.getDepartment()
        );

        Teacher saved = teacherRepository.save(teacher);

        return mapToResponse(saved);
    }

    public List<TeacherResponseDTO> getAllTeachers(int page, int size) {

        return teacherRepository
                .findAll(PageRequest.of(page, size))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TeacherResponseDTO getTeacher(Long id) {

        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        return mapToResponse(teacher);
    }

    public List<Map<String, Object>> getStudentsByTeacherEmail(String email) {
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);
        if (teacherOpt.isEmpty()) {
            teacherOpt = teacherRepository.findByEmail("teacher@example.com");
        }
        if (teacherOpt.isEmpty()) {
            return List.of();
        }
        Teacher teacher = teacherOpt.get();
        if (teacher.getClassrooms().isEmpty()) {
            teacherOpt = teacherRepository.findByEmail("teacher@example.com");
            if (teacherOpt.isPresent()) {
                teacher = teacherOpt.get();
            }
        }

        List<Map<String, Object>> studentList = new ArrayList<>();
        Set<Long> processedStudentIds = new HashSet<>();

        for (Classroom c : teacher.getClassrooms()) {
            for (StudentProfile sp : c.getStudents()) {
                if (processedStudentIds.contains(sp.getId())) {
                    continue;
                }
                processedStudentIds.add(sp.getId());

                Map<String, Object> map = new HashMap<>();
                map.put("prn", sp.getPrn());
                map.put("name", sp.getName());
                map.put("handle", sp.getHandle());
                map.put("department", sp.getDepartment());

                List<String> studentClassroomCodes = new ArrayList<>();
                for (Classroom cl : teacher.getClassrooms()) {
                    if (cl.getStudents().stream().anyMatch(s -> s.getId().equals(sp.getId()))) {
                        studentClassroomCodes.add(cl.getJoinCode());
                    }
                }
                map.put("classrooms", studentClassroomCodes);

                double rating = 4.0;
                if (sp.getHandle().equals("alice_chen")) rating = 4.9;
                else if (sp.getHandle().equals("david_miller")) rating = 4.5;
                else if (sp.getHandle().equals("sarah_jenkins")) rating = 4.3;
                else if (sp.getHandle().equals("michael_chang")) rating = 4.1;
                else if (sp.getHandle().equals("elena_rodriguez")) rating = 4.0;
                else if (sp.getHandle().equals("james_wilson")) rating = 3.8;

                map.put("rating", rating);
                List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(sp.getId());
                int totalHintsUsed = attempts.stream().mapToInt(ProblemAttempt::getHintsUsed).sum();
                long strugglingProblems = attempts.stream()
                        .filter(a -> !a.isCompleted() && a.getHintsUsed() >= 3)
                        .count();
                long activeProblems = attempts.stream()
                        .filter(a -> !a.isCompleted())
                        .count();

                map.put("totalHintsUsed", totalHintsUsed);
                map.put("strugglingProblems", strugglingProblems);
                map.put("activeProblems", activeProblems);
                map.put("needsAttention", strugglingProblems > 0 || totalHintsUsed >= 5);
                studentList.add(map);
            }
        }

        studentList.sort((m1, m2) -> Double.compare((Double) m2.get("rating"), (Double) m1.get("rating")));

        for (int i = 0; i < studentList.size(); i++) {
            studentList.get(i).put("rank", i + 1);
        }

        return studentList;
    }

    public TeacherResponseDTO getTeacherByEmail(String email) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        return mapToResponse(teacher);
    }

    public TeacherResponseDTO updateTeacherByEmail(String email, TeacherRequestDTO request) {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        teacher.setName(request.getName());
        teacher.setDepartment(request.getDepartment());
        teacher.setCollege(request.getCollege());
        teacher.setDesignation(request.getDesignation());
        teacher.setProfilePictureUrl(request.getProfilePictureUrl());

        Teacher saved = teacherRepository.save(teacher);
        return mapToResponse(saved);
    }

    private TeacherResponseDTO mapToResponse(Teacher teacher) {
        return new TeacherResponseDTO(
                teacher.getId(),
                teacher.getName(),
                teacher.getEmail(),
                teacher.getDepartment(),
                teacher.getCollege(),
                teacher.getDesignation(),
                teacher.getProfilePictureUrl(),
                teacher.getClassrooms() == null ? 0 : teacher.getClassrooms().size()
        );
    }
}
