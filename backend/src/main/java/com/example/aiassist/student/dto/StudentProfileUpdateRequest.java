package com.example.aiassist.student.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentProfileUpdateRequest {
    private String name;
    private String prn;
    private String department;
    private String profilePictureUrl;
}
