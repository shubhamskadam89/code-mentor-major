package com.example.aiassist.classroom.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "class_assignment")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    private String title;
    
    @Column(length = 1000)
    private String description;
    
    private String category; // e.g. "DSA Assignments" or "Fundamentals"
    private int totalMarks;
    private LocalDateTime createdAt;
    private LocalDateTime dueDate;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "assignment_problems", joinColumns = @JoinColumn(name = "assignment_id"))
    private List<AssignmentProblem> problems = new ArrayList<>();
}
