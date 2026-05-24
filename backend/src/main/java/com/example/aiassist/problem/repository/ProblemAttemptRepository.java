package com.example.aiassist.problem.repository;

import com.example.aiassist.problem.entity.ProblemAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemAttemptRepository extends JpaRepository<ProblemAttempt, Long> {

    Page<ProblemAttempt> findByStudentProfileIdOrderByTimestampDesc(
            Long studentProfileId,
            Pageable pageable);

    java.util.List<ProblemAttempt> findByStudentProfileId(Long studentProfileId);

    /**
     * Dedup guard: returns true if a completed attempt for the same student+problem
     * already exists within the given time window. Prevents duplicate logging when
     * the content script fires the same event multiple times.
     */
    boolean existsByStudentProfileIdAndProblemIdAndCompletedTrueAndTimestampAfter(
            Long studentProfileId,
            String problemId,
            java.time.LocalDateTime after);
}