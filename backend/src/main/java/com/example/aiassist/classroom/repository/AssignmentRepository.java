package com.example.aiassist.classroom.repository;

import com.example.aiassist.classroom.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByClassroomId(Long classroomId);
    List<Assignment> findByClassroomIdIn(List<Long> classroomIds);
}
