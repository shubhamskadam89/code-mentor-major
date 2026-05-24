package com.example.ai_assist.backend.repository;

import com.example.ai_assist.backend.domain.StudentStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentStatsRepository extends JpaRepository<StudentStats, UUID> {
    Optional<StudentStats> findByStudentId(String studentId);
}
