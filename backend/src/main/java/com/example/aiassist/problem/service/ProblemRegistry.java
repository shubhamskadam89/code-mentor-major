package com.example.aiassist.problem.service;

import com.example.aiassist.common.exception.ResourceNotFoundException;
import com.example.aiassist.problem.entity.Problem;
import com.example.aiassist.problem.repository.ProblemRepository;
import org.springframework.stereotype.Service;

@Service
public class ProblemRegistry {

    private final ProblemRepository problemRepository;

    public ProblemRegistry(ProblemRepository problemRepository) {
        this.problemRepository = problemRepository;
    }

    public Problem getProblem(String id) {
        return problemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
    }
}