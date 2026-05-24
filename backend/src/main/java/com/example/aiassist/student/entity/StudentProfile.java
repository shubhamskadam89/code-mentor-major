package com.example.aiassist.student.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import com.example.aiassist.problem.entity.ProblemAttempt;

@Entity
@Table(name = "student_profile")
@Getter
@Setter
@NoArgsConstructor
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String handle;
    private String prn;
    private String department;
    private String profilePictureUrl;

    private int totalActiveDays;
    private int maxStreak;
    private int currentStreak;

    private int classTestsTaken;
    private double avgTestScore;

    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentPlatformIdentity> platformIdentities = new ArrayList<>();

    @OneToMany(mappedBy = "studentProfile", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProblemAttempt> attempts = new ArrayList<>();

    public StudentProfile(String name, String handle, int totalActiveDays, int maxStreak, int currentStreak,
            int classTestsTaken, double avgTestScore) {
        this.name = name;
        this.handle = handle;
        this.totalActiveDays = totalActiveDays;
        this.maxStreak = maxStreak;
        this.currentStreak = currentStreak;
        this.classTestsTaken = classTestsTaken;
        this.avgTestScore = avgTestScore;
    }
}
