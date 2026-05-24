package com.example.aiassist.ai.analysis.repository;

import com.example.aiassist.ai.analysis.entity.CodeSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface CodeSnapshotRepository extends JpaRepository<CodeSnapshot, UUID> {
}
