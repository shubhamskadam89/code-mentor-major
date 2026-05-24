package com.example.aiassist.classroom.repository;

import com.example.aiassist.classroom.entity.Classroom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    Optional<Classroom> findByJoinCode(String joinCode);

    Page<Classroom> findByTeacherId(Long teacherId, Pageable pageable);

    @Query("SELECT c FROM Classroom c JOIN c.students s WHERE s.id = :studentId")
    List<Classroom> findByStudentId(@Param("studentId") Long studentId);
}