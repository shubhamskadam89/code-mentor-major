package com.example.aiassist.classroom.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ClassroomRequestDTO {
    private String name;
    private String subjectName;
    private String semester;
    private String division;
    private Long teacherId;
}