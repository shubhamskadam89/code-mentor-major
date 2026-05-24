package com.example.aiassist.classroom.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ClassroomResponseDTO {
    private Long id;
    private String name;
    private String subjectName;
    private String semester;
    private String division;
    private String joinCode;
    private String teacherName;
    private int studentCount;
    private int activeAssignmentCount;
    private boolean isArchived;
    private LocalDateTime createdAt;
}