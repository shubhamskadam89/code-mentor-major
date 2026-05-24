package com.example.aiassist.auth.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role; // "STUDENT" or "TEACHER"
    private String classCode;
    private String institution;
    private String handle;
}
