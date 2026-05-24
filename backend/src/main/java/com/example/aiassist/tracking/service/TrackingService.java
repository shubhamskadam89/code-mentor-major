package com.example.aiassist.tracking.service;

import com.example.aiassist.common.exception.ResourceNotFoundException;
import com.example.aiassist.problem.entity.ProblemAttempt;
import com.example.aiassist.problem.repository.ProblemAttemptRepository;
import com.example.aiassist.student.dto.ProblemAttemptResponseDTO;
import com.example.aiassist.student.dto.ProblemTrackingRequest;
import com.example.aiassist.student.entity.StudentProfile;
import com.example.aiassist.student.repository.StudentProfileRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TrackingService {

    private final StudentProfileRepository studentRepository;
    private final ProblemAttemptRepository attemptRepository;

    public TrackingService(StudentProfileRepository studentRepository,
                           ProblemAttemptRepository attemptRepository) {
        this.studentRepository = studentRepository;
        this.attemptRepository = attemptRepository;
    }

    public ProblemAttemptResponseDTO logAttempt(ProblemTrackingRequest request) {

        StudentProfile profile = studentRepository.findByHandle(request.getHandle())
                .orElseGet(() -> {
                    StudentProfile newProfile = new StudentProfile();
                    newProfile.setHandle(request.getHandle());
                    newProfile.setName("New Student");
                    newProfile.setCurrentStreak(0);
                    newProfile.setMaxStreak(0);
                    newProfile.setTotalActiveDays(0);
                    return studentRepository.save(newProfile);
                });

        // ── Dedup guard ──────────────────────────────────────────────────────────────
        // If a completed attempt for this student+problem already exists within the
        // last 5 minutes, skip saving and return the existing record. This prevents
        // duplicate rows when the extension content script fires multiple times for
        // the same accepted submission.
        if (request.isCompleted()) {
            LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
            boolean alreadyLogged = attemptRepository
                    .existsByStudentProfileIdAndProblemIdAndCompletedTrueAndTimestampAfter(
                            profile.getId(),
                            request.getProblemId(),
                            fiveMinutesAgo);

            if (alreadyLogged) {
                // Return a lightweight stub instead of a full DB save
                ProblemAttempt stub = new ProblemAttempt(
                        profile,
                        request.getPlatform(),
                        request.getProblemId(),
                        request.getDifficulty(),
                        request.getHintsUsed(),
                        request.isCompleted(),
                        LocalDateTime.now()
                );
                stub.setId(-1L); // sentinel so UI knows it was deduped
                return mapToResponse(stub);
            }
        }
        // ── End dedup guard ──────────────────────────────────────────────────────────

        ProblemAttempt attempt = new ProblemAttempt(
                profile,
                request.getPlatform(),
                request.getProblemId(),
                request.getDifficulty(),
                request.getHintsUsed(),
                request.isCompleted(),
                LocalDateTime.now()
        );

        ProblemAttempt saved = attemptRepository.save(attempt);

        return mapToResponse(saved);
    }

    public List<ProblemAttemptResponseDTO> getAttemptsByStudent(
            Long studentId,
            int page,
            int size) {

        studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        return attemptRepository
                .findByStudentProfileIdOrderByTimestampDesc(
                        studentId,
                        PageRequest.of(page, size))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProblemAttemptResponseDTO> getAttemptsByStudentHandle(
            String handle,
            int page,
            int size) {

        java.util.Optional<StudentProfile> profileOpt = studentRepository.findByHandle(handle);
        if (profileOpt.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        StudentProfile profile = profileOpt.get();
        return attemptRepository
                .findByStudentProfileIdOrderByTimestampDesc(
                        profile.getId(),
                        PageRequest.of(page, size))
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ProblemAttemptResponseDTO mapToResponse(ProblemAttempt attempt) {
        return new ProblemAttemptResponseDTO(
                attempt.getId(),
                attempt.getStudentProfile().getHandle(),
                attempt.getPlatform(),
                attempt.getProblemId(),
                attempt.getDifficulty(),
                attempt.getHintsUsed(),
                attempt.isCompleted(),
                attempt.getTimestamp()
        );
    }
}