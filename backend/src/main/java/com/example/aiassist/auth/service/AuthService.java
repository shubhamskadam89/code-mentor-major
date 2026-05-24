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
        // 1. Ensure default teacher
        Teacher teacher = teacherRepository.findByEmail("teacher@example.com")
            .orElseGet(() -> teacherRepository.save(new Teacher("Dr. Elizabeth Vance", "teacher@example.com", "Computer Science")));
        
        if (!userRepository.existsByEmail("teacher@example.com")) {
            userRepository.save(User.builder()
                .name("Dr. Elizabeth Vance")
                .email("teacher@example.com")
                .password(passwordEncoder.encode("password"))
                .role(User.Role.TEACHER)
                .build());
        }

        // 2. Ensure default classroom CS401X
        Classroom classroom = classroomRepository.findByJoinCode("CS401X")
            .orElseGet(() -> classroomRepository.save(new Classroom("CS401 - Data Structures & Algorithms II", "CS401X", teacher)));

        // 3. Ensure mock students and their attempts
        String[] mockNames = {"Alice Chen", "David Miller", "Sarah Jenkins", "Michael Chang"};
        String[] mockHandles = {"alice_chen", "david_miller", "sarah_jenkins", "michael_chang"};
        int[] activeDays = {120, 110, 95, 80};
        int[] maxStreaks = {15, 10, 8, 6};
        int[] currentStreaks = {12, 4, 3, 0};
        double[] avgScores = {92.0, 85.0, 88.0, 79.0};
        int[] solvedCounts = {315, 289, 245, 210};

        boolean classroomUpdated = false;
        for (int i = 0; i < mockNames.length; i++) {
            final String handle = mockHandles[i];
            final String name = mockNames[i];
            final int activeD = activeDays[i];
            final int maxS = maxStreaks[i];
            final int currS = currentStreaks[i];
            final double avgSc = avgScores[i];
            final int solvedCount = solvedCounts[i];
            
            StudentProfile mockSp = studentProfileRepository.findByHandle(handle)
                .orElseGet(() -> studentProfileRepository.save(new StudentProfile(name, handle, activeD, maxS, currS, 12, avgSc)));
            
            // Seed attempts for mock student if none exist
            if (problemAttemptRepository.findByStudentProfileId(mockSp.getId()).isEmpty()) {
                List<ProblemAttempt> attemptsToSave = new ArrayList<>();
                int easyLimit = (int)(solvedCount * 0.45);
                int medLimit = (int)(solvedCount * 0.40);
                
                for (int j = 0; j < solvedCount; j++) {
                    String diff = "Easy";
                    if (j >= easyLimit && j < easyLimit + medLimit) {
                        diff = "Medium";
                    } else if (j >= easyLimit + medLimit) {
                        diff = "Hard";
                    }
                    attemptsToSave.add(new ProblemAttempt(mockSp, Platform.LEETCODE, "leetcode_" + j, diff, 0, true, LocalDateTime.now().minusDays(j % 30)));
                }
                problemAttemptRepository.saveAll(attemptsToSave);
            }

            if (classroom.getStudents().stream().noneMatch(s -> s.getHandle().equals(handle))) {
                classroom.getStudents().add(mockSp);
                classroomUpdated = true;
            }
        }
        if (classroomUpdated) {
            classroomRepository.save(classroom);
        }
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
