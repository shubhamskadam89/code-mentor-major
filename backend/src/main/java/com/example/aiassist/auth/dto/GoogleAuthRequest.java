package com.example.aiassist.auth.dto;

import lombok.Data;

@Data
public class GoogleAuthRequest {
    private String googleToken;
    private String name;
    private String email;
    private String role;
}
