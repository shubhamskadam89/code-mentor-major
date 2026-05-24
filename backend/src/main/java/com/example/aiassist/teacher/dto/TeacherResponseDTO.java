package com.example.aiassist.teacher.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class TeacherResponseDTO {
    private Long id;
    private String name;
    private String email;
    private String department;
    private String college;
    private String designation;
    private String profilePictureUrl;
    private int classroomCount;
}