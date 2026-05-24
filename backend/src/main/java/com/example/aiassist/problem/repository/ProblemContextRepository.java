package com.example.aiassist.problem.repository;

import com.example.aiassist.problem.entity.ProblemContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface ProblemContextRepository extends JpaRepository<ProblemContext, UUID> {
}
