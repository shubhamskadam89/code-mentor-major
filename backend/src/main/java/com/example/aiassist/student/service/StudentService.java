package com.example.aiassist.student.service;

import com.example.aiassist.classroom.entity.Classroom;
import com.example.aiassist.classroom.repository.ClassroomRepository;
import com.example.aiassist.common.exception.ResourceNotFoundException;
import com.example.aiassist.student.dto.StudentProfileResponse;
import com.example.aiassist.student.dto.StudentProfileUpdateRequest;
import com.example.aiassist.student.entity.StudentProfile;
import com.example.aiassist.student.repository.StudentProfileRepository;
import com.example.aiassist.problem.entity.ProblemAttempt;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final ClassroomRepository classroomRepository;

    public StudentService(StudentProfileRepository studentProfileRepository,
                          ClassroomRepository classroomRepository) {
        this.studentProfileRepository = studentProfileRepository;
        this.classroomRepository = classroomRepository;
    }

    public StudentProfileResponse getProfileByHandle(String handle) {
        StudentProfile profile = studentProfileRepository.findByHandle(handle)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for handle: " + handle));

        return mapToResponse(profile);
    }

    public StudentProfileResponse updateProfileByHandle(String handle, StudentProfileUpdateRequest request) {
        StudentProfile profile = studentProfileRepository.findByHandle(handle)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for handle: " + handle));

        profile.setName(request.getName());
        profile.setPrn(request.getPrn());
        profile.setDepartment(request.getDepartment());
        profile.setProfilePictureUrl(request.getProfilePictureUrl());

        StudentProfile saved = studentProfileRepository.save(profile);
        return mapToResponse(saved);
    }

    private StudentProfileResponse mapToResponse(StudentProfile profile) {
        List<Classroom> classrooms = classroomRepository.findByStudentId(profile.getId());
        List<String> classroomNames = classrooms.stream().map(Classroom::getName).toList();
        
        long solvedCount = profile.getAttempts() == null ? 0 :
                profile.getAttempts().stream().filter(ProblemAttempt::isCompleted).count();

        return new StudentProfileResponse(
                profile.getId(),
                profile.getName(),
                profile.getHandle(),
                profile.getPrn(),
                profile.getDepartment(),
                profile.getProfilePictureUrl(),
                classrooms.size(),
                (int) solvedCount,
                classroomNames
        );
    }
}
