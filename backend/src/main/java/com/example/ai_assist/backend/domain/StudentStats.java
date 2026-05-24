package com.example.ai_assist.backend.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "student_stats")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentStats {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true)
    private String studentId; // Could be sessionId or a stable ID from extension

    private int hintsUsedCount = 0;
    private int problemsSolvedCount = 0;
    private int problemsAttemptedCount = 0;
    private double accuracy = 0.0;
    private String level = "beginner"; // beginner, intermediate, pro

    public void calculateAccuracy() {
        if (problemsAttemptedCount > 0) {
            this.accuracy = (double) problemsSolvedCount / problemsAttemptedCount * 100;
        }
    }
}
