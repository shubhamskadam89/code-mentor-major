package com.example.aiassist.classroom.dto;

import com.example.aiassist.classroom.entity.AssignmentProblem;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentRequestDTO {
    private Long classroomId;
    private String title;
    private String description;
    private String category;
    private int totalMarks;
    private LocalDateTime dueDate;
    private List<AssignmentProblem> problems;
}
