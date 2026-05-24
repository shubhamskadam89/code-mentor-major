package com.example.aiassist.student.repository;

import com.example.aiassist.student.entity.StudentPlatformIdentity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentPlatformIdentityRepository extends JpaRepository<StudentPlatformIdentity, Long> {
    List<StudentPlatformIdentity> findByStudentProfileId(Long studentProfileId);
}
