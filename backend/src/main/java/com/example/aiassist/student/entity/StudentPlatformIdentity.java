package com.example.aiassist.student.entity;

import com.example.aiassist.core.platform.Platform;
import jakarta.persistence.*;

@Entity
@Table(name = "student_platform_identity")
public class StudentPlatformIdentity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform;

    @Column(name = "platform_username", nullable = false)
    private String platformUsername;

    public StudentPlatformIdentity() {
    }

    public StudentPlatformIdentity(StudentProfile studentProfile, Platform platform, String platformUsername) {
        this.studentProfile = studentProfile;
        this.platform = platform;
        this.platformUsername = platformUsername;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StudentProfile getStudentProfile() {
        return studentProfile;
    }

    public void setStudentProfile(StudentProfile studentProfile) {
        this.studentProfile = studentProfile;
    }

    public Platform getPlatform() {
        return platform;
    }

    public void setPlatform(Platform platform) {
        this.platform = platform;
    }

    public String getPlatformUsername() {
        return platformUsername;
    }

    public void setPlatformUsername(String platformUsername) {
        this.platformUsername = platformUsername;
    }
}
