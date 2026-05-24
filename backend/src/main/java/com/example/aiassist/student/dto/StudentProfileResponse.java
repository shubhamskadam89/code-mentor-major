package com.example.aiassist.student.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileResponse {
    private Long id;
    private String name;
    private String handle;
    private String prn;
    private String department;
    private String profilePictureUrl;
    private int joinedClassroomsCount;
    private int solvedProblemsCount;
    private List<String> joinedClassroomNames;
}
