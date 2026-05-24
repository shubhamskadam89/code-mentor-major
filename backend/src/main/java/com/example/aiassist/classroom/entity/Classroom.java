package com.example.aiassist.classroom.entity;

import com.example.aiassist.teacher.entity.Teacher;
import com.example.aiassist.student.entity.StudentProfile;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "classroom")
@Getter
@Setter
@NoArgsConstructor
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String subjectName;
    private String semester;
    private String division;
    private boolean isArchived = false;

    @Column(unique = true, nullable = false)
    private String joinCode;

    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToMany
    @JoinTable(
            name = "classroom_students",
            joinColumns = @JoinColumn(name = "classroom_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private Set<StudentProfile> students = new HashSet<>();

    // 👇 Business constructor
    public Classroom(String name, String joinCode, Teacher teacher) {
        this.name = name;
        this.joinCode = joinCode;
        this.teacher = teacher;
        this.createdAt = LocalDateTime.now();
    }
}