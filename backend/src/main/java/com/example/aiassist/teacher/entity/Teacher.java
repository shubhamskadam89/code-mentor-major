package com.example.aiassist.teacher.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import com.example.aiassist.classroom.entity.Classroom;

@Entity
@Getter
@Setter
@Table(name = "teacher")
public class Teacher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String department;
    private String college;
    private String designation;
    private String profilePictureUrl;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL)
    private List<Classroom> classrooms = new ArrayList<>();

    public Teacher() {
    }

    public Teacher(String name, String email, String department) {
        this.name = name;
        this.email = email;
        this.department = department;
    }
}