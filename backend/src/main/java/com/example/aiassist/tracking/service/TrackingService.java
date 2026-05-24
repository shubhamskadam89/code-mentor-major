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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Map;

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

        StudentProfile profile = getOrCreateProfile(request.getHandle());
        String problemId = canonicalProblemId(request.getProblemId());

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
                            problemId,
                            fiveMinutesAgo);

            if (alreadyLogged) {
                // Return a lightweight stub instead of a full DB save
                ProblemAttempt stub = new ProblemAttempt(
                        profile,
                        request.getPlatform(),
                        problemId,
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

        ProblemAttempt attempt = attemptRepository
                .findTopByStudentProfileIdAndProblemIdOrderByTimestampDesc(profile.getId(), problemId)
                .orElseGet(() -> new ProblemAttempt(
                        profile,
                        request.getPlatform(),
                        problemId,
                        request.getDifficulty(),
                        0,
                        false,
                        LocalDateTime.now()
                ));

        attempt.setPlatform(request.getPlatform());
        attempt.setProblemId(problemId);
        attempt.setDifficulty(request.getDifficulty());
        attempt.setHintsUsed(Math.max(attempt.getHintsUsed(), request.getHintsUsed()));
        attempt.setCompleted(request.isCompleted());
        attempt.setTimestamp(LocalDateTime.now());

        ProblemAttempt saved = attemptRepository.save(attempt);

        return mapToResponse(saved);
    }

    @Transactional
    public ProblemAttemptResponseDTO logHintUsage(ProblemTrackingRequest request) {
        StudentProfile profile = getOrCreateProfile(request.getHandle());
        String problemId = canonicalProblemId(request.getProblemId());

        ProblemAttempt attempt = attemptRepository
                .findTopByStudentProfileIdAndProblemIdOrderByTimestampDesc(profile.getId(), problemId)
                .orElseGet(() -> new ProblemAttempt(
                        profile,
                        request.getPlatform(),
                        problemId,
                        request.getDifficulty(),
                        0,
                        false,
                        LocalDateTime.now()
                ));

        attempt.setHintsUsed(attempt.getHintsUsed() + Math.max(1, request.getHintsUsed()));
        attempt.setCompleted(attempt.isCompleted() || request.isCompleted());
        attempt.setTimestamp(LocalDateTime.now());
        if (request.getDifficulty() != null && !request.getDifficulty().isBlank()) {
            attempt.setDifficulty(request.getDifficulty());
        }
        if (request.getPlatform() != null) {
            attempt.setPlatform(request.getPlatform());
        }

        return mapToResponse(attemptRepository.save(attempt));
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
                .map(attempt -> {
                    attempt.setProblemId(canonicalProblemId(attempt.getProblemId()));
                    return mapToResponse(attempt);
                })
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
        List<ProblemAttempt> attempts = attemptRepository
                .findByStudentProfileIdOrderByTimestampDesc(
                        profile.getId(),
                        PageRequest.of(page, size))
                .getContent();

        return mapMergedAttemptsToResponses(attempts);
    }

    private List<ProblemAttemptResponseDTO> mapMergedAttemptsToResponses(List<ProblemAttempt> attempts) {
        Map<String, List<ProblemAttempt>> grouped = new LinkedHashMap<>();
        for (ProblemAttempt attempt : attempts) {
            String key = canonicalProblemId(attempt.getProblemId());
            grouped.computeIfAbsent(key, ignored -> new ArrayList<>()).add(attempt);
        }

        List<ProblemAttemptResponseDTO> response = new ArrayList<>();
        for (Map.Entry<String, List<ProblemAttempt>> entry : grouped.entrySet()) {
            List<ProblemAttempt> group = entry.getValue();
            ProblemAttempt latest = group.get(0);
            int hintsUsed = group.stream().mapToInt(ProblemAttempt::getHintsUsed).sum();
            boolean completed = group.stream().anyMatch(ProblemAttempt::isCompleted);
            String difficulty = group.stream()
                    .map(ProblemAttempt::getDifficulty)
                    .filter(value -> value != null && !value.isBlank() && !"unknown".equalsIgnoreCase(value))
                    .findFirst()
                    .orElse(latest.getDifficulty());

            response.add(new ProblemAttemptResponseDTO(
                    latest.getId(),
                    latest.getStudentProfile().getHandle(),
                    latest.getPlatform(),
                    entry.getKey(),
                    difficulty,
                    hintsUsed,
                    completed,
                    hintsUsed >= 3 && !completed,
                    latest.getTimestamp()
            ));
        }
        return response;
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
                attempt.getHintsUsed() >= 3 && !attempt.isCompleted(),
                attempt.getTimestamp()
        );
    }

    private StudentProfile getOrCreateProfile(String handle) {
        return studentRepository.findByHandle(handle)
                .orElseGet(() -> {
                    StudentProfile newProfile = new StudentProfile();
                    newProfile.setHandle(handle);
                    newProfile.setName(handle);
                    newProfile.setPrn("");
                    newProfile.setDepartment("General");
                    newProfile.setCurrentStreak(0);
                    newProfile.setMaxStreak(0);
                    newProfile.setTotalActiveDays(0);
                    return studentRepository.save(newProfile);
                });
    }

    private String canonicalProblemId(String problemId) {
        if (problemId == null) {
            return "";
        }
        String normalized = problemId.toLowerCase().trim();
        normalized = normalized.replaceAll("^https?://[^/]+/(problems|challenges)/([^/?#]+).*$", "$2");
        normalized = normalized.replaceAll("^(leetcode|gfg|geeksforgeeks|codechef|hackerrank)[_-]+", "");
        normalized = normalized.replaceAll("[^a-z0-9]+", "-");
        normalized = normalized.replaceAll("^-+|-+$", "");
        return normalized;
    }
}
