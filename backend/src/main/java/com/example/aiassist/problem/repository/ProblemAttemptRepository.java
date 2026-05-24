package com.example.aiassist.problem.repository;

import com.example.aiassist.problem.entity.ProblemAttempt;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ProblemAttemptRepository extends JpaRepository<ProblemAttempt, Long> {

    Page<ProblemAttempt> findByStudentProfileIdOrderByTimestampDesc(
            Long studentProfileId,
            Pageable pageable);

    List<ProblemAttempt> findByStudentProfileId(Long studentProfileId);

    List<ProblemAttempt> findByStudentProfileIdIn(List<Long> studentProfileIds);

    Optional<ProblemAttempt> findTopByStudentProfileIdAndProblemIdOrderByTimestampDesc(
            Long studentProfileId,
            String problemId);

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
