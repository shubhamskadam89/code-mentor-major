package com.example.aiassist.auth.service;

import com.example.aiassist.auth.dto.AuthResponse;
import com.example.aiassist.auth.dto.GoogleAuthRequest;
import com.example.aiassist.auth.dto.LoginRequest;
import com.example.aiassist.auth.dto.RegisterRequest;
import com.example.aiassist.auth.entity.User;
import com.example.aiassist.auth.repository.UserRepository;
import com.example.aiassist.auth.security.JwtUtil;
import com.example.aiassist.common.exception.BadRequestException;
import com.example.aiassist.student.entity.StudentProfile;
import com.example.aiassist.student.repository.StudentProfileRepository;
import com.example.aiassist.teacher.entity.Teacher;
import com.example.aiassist.teacher.repository.TeacherRepository;
import com.example.aiassist.classroom.entity.Classroom;
import com.example.aiassist.classroom.repository.ClassroomRepository;
import com.example.aiassist.core.platform.Platform;
import com.example.aiassist.problem.entity.ProblemAttempt;
import com.example.aiassist.problem.repository.ProblemAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final GoogleOAuthService googleOAuthService;
    private final StudentProfileRepository studentProfileRepository;
    private final TeacherRepository teacherRepository;
    private final ClassroomRepository classroomRepository;
    private final ProblemAttemptRepository problemAttemptRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            role = User.Role.STUDENT;
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .handle(request.getHandle())
                .classCode(request.getClassCode())
                .institution(request.getInstitution())
                .build();

        User saved = userRepository.save(user);

        if (role == User.Role.STUDENT) {
            String studentHandle = request.getHandle();
            if (studentHandle == null || studentHandle.isBlank()) {
                studentHandle = request.getEmail().split("@")[0];
            }
            ensureDefaultClassroomAndMockStudents();
            Classroom defaultClassroom = classroomRepository.findByJoinCode("CS401X").orElse(null);

            final String finalHandle = studentHandle;
            StudentProfile sp = studentProfileRepository.findByHandle(finalHandle)
                .orElseGet(() -> {
                    StudentProfile newSp = new StudentProfile();
                    newSp.setName(request.getName());
                    newSp.setHandle(finalHandle);
                    newSp.setCurrentStreak(0);
                    newSp.setMaxStreak(0);
                    newSp.setTotalActiveDays(0);
                    return studentProfileRepository.save(newSp);
                });
            
            if (defaultClassroom != null && !defaultClassroom.getStudents().contains(sp)) {
                defaultClassroom.getStudents().add(sp);
                classroomRepository.save(defaultClassroom);
            }
        } else if (role == User.Role.TEACHER) {
            ensureDefaultClassroomAndMockStudents();
            teacherRepository.findByEmail(request.getEmail())
                .orElseGet(() -> teacherRepository.save(new Teacher(request.getName(), request.getEmail(), "Computer Science")));
        }

        String token = jwtUtil.generateToken(saved.getEmail(), saved.getRole().name(), saved.getId());
        return buildResponse(saved, token);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("No account found with this email."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect password.");
        }

        // Check if student profile needs default classroom enrollment
        if (user.getRole() == User.Role.STUDENT) {
            String handle = user.getHandle();
            if (handle == null || handle.isBlank()) {
                handle = user.getEmail().split("@")[0];
                user.setHandle(handle);
                user = userRepository.save(user);
            }
            ensureDefaultClassroomAndMockStudents();
            Classroom defaultClassroom = classroomRepository.findByJoinCode("CS401X").orElse(null);
            final String finalHandle = handle;
            final User finalUser = user;
            StudentProfile sp = studentProfileRepository.findByHandle(finalHandle)
                .orElseGet(() -> {
                    StudentProfile newSp = new StudentProfile();
                    newSp.setName(finalUser.getName());
                    newSp.setHandle(finalHandle);
                    newSp.setCurrentStreak(0);
                    newSp.setMaxStreak(0);
                    newSp.setTotalActiveDays(0);
                    return studentProfileRepository.save(newSp);
                });
            
            if (defaultClassroom != null && !defaultClassroom.getStudents().contains(sp)) {
                defaultClassroom.getStudents().add(sp);
                classroomRepository.save(defaultClassroom);
            }
        } else if (user.getRole() == User.Role.TEACHER) {
            ensureDefaultClassroomAndMockStudents();
            final String fEmail = user.getEmail();
            final String fName = user.getName();
            teacherRepository.findByEmail(fEmail)
                .orElseGet(() -> teacherRepository.save(new Teacher(fName, fEmail, "Computer Science")));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return buildResponse(user, token);
    }

    public AuthResponse processOAuth2Login(String email, String name) {
        return processOAuth2Login(email, name, User.Role.STUDENT);
    }

    public AuthResponse processOAuth2Login(String email, String name, User.Role requestedRole) {
        User.Role role = requestedRole == null ? User.Role.STUDENT : requestedRole;
        
        User user = userRepository.findByEmail(email)
                .map(existing -> {
                    if (existing.getName() == null || existing.getName().isBlank()) {
                        existing.setName(name != null && !name.isBlank() ? name : email);
                        return userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> {
                    String derivedHandle = email.split("@")[0];
                    return userRepository.save(User.builder()
                        .name(name != null && !name.isBlank() ? name : email)
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .role(role)
                        .handle(derivedHandle)
                        .build());
                });

        if (user.getRole() == User.Role.STUDENT) {
            String handle = user.getHandle();
            if (handle == null || handle.isBlank()) {
                handle = email.split("@")[0];
                user.setHandle(handle);
                user = userRepository.save(user);
            }
            ensureDefaultClassroomAndMockStudents();
            Classroom defaultClassroom = classroomRepository.findByJoinCode("CS401X").orElse(null);

            final String finalHandle = handle;
            final User finalUser = user;
            StudentProfile sp = studentProfileRepository.findByHandle(finalHandle)
                .orElseGet(() -> {
                    StudentProfile newSp = new StudentProfile();
                    newSp.setName(finalUser.getName());
                    newSp.setHandle(finalHandle);
                    newSp.setCurrentStreak(0);
                    newSp.setMaxStreak(0);
                    newSp.setTotalActiveDays(0);
                    return studentProfileRepository.save(newSp);
                });
            
            if (defaultClassroom != null && !defaultClassroom.getStudents().contains(sp)) {
                defaultClassroom.getStudents().add(sp);
                classroomRepository.save(defaultClassroom);
            }
        } else if (user.getRole() == User.Role.TEACHER) {
            ensureDefaultClassroomAndMockStudents();
            final String fEmail = user.getEmail();
            final String fName = user.getName();
            teacherRepository.findByEmail(fEmail)
                .orElseGet(() -> teacherRepository.save(new Teacher(fName, fEmail, "Computer Science")));
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        return buildResponse(user, token);
    }

    public AuthResponse loginWithGoogleToken(GoogleAuthRequest request) {
        String googleEmail = googleOAuthService.fetchEmail(request.getGoogleToken());
        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !googleEmail.equalsIgnoreCase(request.getEmail())) {
            throw new BadRequestException("Google token email does not match request email.");
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (Exception e) {
            role = User.Role.STUDENT;
        }

        return processOAuth2Login(googleEmail, request.getName(), role);
    }

    @Transactional
    public void ensureDefaultClassroomAndMockStudents() {
        // No seeding in production
    }

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .classCode(user.getClassCode())
                .institution(user.getInstitution())
                .handle(user.getHandle())
                .build();
    }
}
