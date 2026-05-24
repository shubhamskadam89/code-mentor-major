package com.example.ai_assist.backend.service;

import com.example.ai_assist.backend.domain.StudentStats;
import com.example.ai_assist.backend.repository.StudentStatsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class StudentService {

    private final StudentStatsRepository repository;

    public StudentService(StudentStatsRepository repository) {
        this.repository = repository;
    }

    public StudentStats getOrCreateStats(String studentId) {
        return repository.findByStudentId(studentId)
                .orElseGet(() -> {
                    StudentStats stats = new StudentStats();
                    stats.setStudentId(studentId);
                    return repository.save(stats);
                });
    }

    @Transactional
    public void incrementHintsUsed(String studentId) {
        StudentStats stats = getOrCreateStats(studentId);
        stats.setHintsUsedCount(stats.getHintsUsedCount() + 1);
        repository.save(stats);
    }

    @Transactional
    public void recordProblemAttempt(String studentId, boolean solved) {
        StudentStats stats = getOrCreateStats(studentId);
        stats.setProblemsAttemptedCount(stats.getProblemsAttemptedCount() + 1);
        if (solved) {
            stats.setProblemsSolvedCount(stats.getProblemsSolvedCount() + 1);
        }
        stats.calculateAccuracy();
        repository.save(stats);
    }

    @Transactional
    public void updateLevel(String studentId, String level) {
        StudentStats stats = getOrCreateStats(studentId);
        stats.setLevel(level);
        repository.save(stats);
    }
}
