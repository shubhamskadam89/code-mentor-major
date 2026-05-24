package com.example.aiassist.teacher.controller;

import com.example.aiassist.teacher.entity.Teacher;
import com.example.aiassist.teacher.repository.TeacherRepository;
import com.example.aiassist.problem.entity.ProblemAttempt;
import com.example.aiassist.student.entity.StudentProfile;
import com.example.aiassist.teacher.dto.DashboardStatsResponse;
import com.example.aiassist.problem.repository.ProblemAttemptRepository;
import com.example.aiassist.student.repository.StudentProfileRepository;
import com.example.aiassist.classroom.entity.Assignment;
import com.example.aiassist.classroom.repository.AssignmentRepository;
import com.example.aiassist.classroom.entity.Classroom;
import com.example.aiassist.classroom.repository.ClassroomRepository;
import com.example.aiassist.classroom.entity.AssignmentProblem;
import com.example.aiassist.core.platform.Platform;
import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/dashboard")
@CrossOrigin(origins = "*") // Allows extension frontend to hit this API easily
public class DashboardController {

        private final StudentProfileRepository studentProfileRepository;
        private final ProblemAttemptRepository problemAttemptRepository;
        private final AssignmentRepository assignmentRepository;
        private final ClassroomRepository classroomRepository;
        private final TeacherRepository teacherRepository;

        public DashboardController(StudentProfileRepository studentProfileRepository,
                        ProblemAttemptRepository problemAttemptRepository,
                        AssignmentRepository assignmentRepository,
                        ClassroomRepository classroomRepository,
                        TeacherRepository teacherRepository) {
                this.studentProfileRepository = studentProfileRepository;
                this.problemAttemptRepository = problemAttemptRepository;
                this.assignmentRepository = assignmentRepository;
                this.classroomRepository = classroomRepository;
                this.teacherRepository = teacherRepository;
        }

        @GetMapping("/stats/{handle}")
        public ResponseEntity<DashboardStatsResponse> getDashboardStats(@PathVariable String handle) {
                Optional<StudentProfile> profileOpt = studentProfileRepository.findByHandle(handle);

                if (profileOpt.isEmpty()) {
                        // Return an empty template rather than 404 so dashboard can still load
                        DashboardStatsResponse empty = new DashboardStatsResponse();
                        empty.setStudentName("New Student");
                        empty.setHandle(handle);
                        empty.setTotalActiveDays(0);
                        empty.setMaxStreak(0);
                        empty.setCurrentStreak(0);
                        empty.setClassTestsTaken(0);
                        empty.setAvgTestScore(0);
                        empty.setDsaStats(Arrays.asList(
                                        Map.of("name", "Easy", "value", 0, "color", "#10b981"),
                                        Map.of("name", "Medium", "value", 0, "color", "#eab308"),
                                        Map.of("name", "Hard", "value", 0, "color", "#ef4444")));
                        empty.setFundamentalsStats(List.of(
                                        Map.of("name", "Completed", "value", 0, "color", "#10b981")));
                        return ResponseEntity.ok(empty);
                }

                StudentProfile profile = profileOpt.get();
                List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(profile.getId());

                DashboardStatsResponse response = new DashboardStatsResponse();
                response.setStudentName(profile.getName());
                response.setHandle(profile.getHandle());
                response.setTotalActiveDays(profile.getTotalActiveDays());
                response.setMaxStreak(profile.getMaxStreak());
                response.setCurrentStreak(profile.getCurrentStreak());
                response.setClassTestsTaken(profile.getClassTestsTaken());
                response.setAvgTestScore(profile.getAvgTestScore());

                // Process DSA Stats (Easy, Medium, Hard) - Use all problem attempts for the DSA
                // donut
                long easyCount = attempts.stream()
                                .filter(a -> "Easy".equalsIgnoreCase(a.getDifficulty()) && a.isCompleted()).count();
                long mediumCount = attempts.stream()
                                .filter(a -> "Medium".equalsIgnoreCase(a.getDifficulty()) && a.isCompleted()).count();
                long hardCount = attempts.stream()
                                .filter(a -> "Hard".equalsIgnoreCase(a.getDifficulty()) && a.isCompleted()).count();

                List<Map<String, Object>> dsaStats = Arrays.asList(
                                Map.of("name", "Easy", "value", easyCount, "color", "#10b981"),
                                Map.of("name", "Medium", "value", mediumCount, "color", "#eab308"),
                                Map.of("name", "Hard", "value", hardCount, "color", "#ef4444"));
                response.setDsaStats(dsaStats);

                // Process Fundamentals (Mock this out for now or compute based on another
                // metric)
                response.setFundamentalsStats(List.of(
                                Map.of("name", "Completed", "value", attempts.size(), "color", "#10b981")));

                return ResponseEntity.ok(response);
        }

        @GetMapping("/assignments/{handle}")
        public ResponseEntity<List<Map<String, Object>>> getAssignments(@PathVariable String handle) {
                Optional<StudentProfile> profileOpt = studentProfileRepository.findByHandle(handle);
                if (profileOpt.isEmpty()) {
                        return ResponseEntity.ok(Collections.emptyList());
                }
                StudentProfile profile = profileOpt.get();

                List<Classroom> classrooms = classroomRepository.findByStudentId(profile.getId());
                if (classrooms.isEmpty()) {
                        Optional<Classroom> defaultClassOpt = classroomRepository.findByJoinCode("CS401X");
                        if (defaultClassOpt.isPresent()) {
                                Classroom defaultClassroom = defaultClassOpt.get();
                                defaultClassroom.getStudents().add(profile);
                                classroomRepository.save(defaultClassroom);
                                classrooms = List.of(defaultClassroom);
                        }
                }

                List<Long> classroomIds = classrooms.stream().map(Classroom::getId).toList();
                List<Assignment> dbAssignments = classroomIds.isEmpty()
                                ? Collections.emptyList()
                                : assignmentRepository.findByClassroomIdIn(classroomIds);

                if (dbAssignments.isEmpty() && !classrooms.isEmpty()) {
                        Classroom classroom = classrooms.get(0);
                        dbAssignments = new ArrayList<>();

                        // Assignment 1: Advanced Graph Algorithms (with 2 problems)
                        Assignment a1 = new Assignment();
                        a1.setClassroom(classroom);
                        a1.setTitle("Advanced Graph Algorithms");
                        a1.setCategory("DSA Assignments");
                        a1.setCreatedAt(LocalDateTime.now().minusDays(2));
                        a1.setDueDate(LocalDateTime.now().plusDays(1)); // Tomorrow
                        a1.setProblems(List.of(
                                new AssignmentProblem("two-sum", "LEETCODE", "Two Sum", "Easy"),
                                new AssignmentProblem("add-two-numbers", "LEETCODE", "Add Two Numbers", "Medium")
                        ));
                        dbAssignments.add(assignmentRepository.save(a1));

                        // Assignment 2: Dynamic Programming Challenge (with 1 problem)
                        Assignment a2 = new Assignment();
                        a2.setClassroom(classroom);
                        a2.setTitle("Dynamic Programming Challenge");
                        a2.setCategory("DSA Assignments");
                        a2.setCreatedAt(LocalDateTime.now().minusDays(1));
                        a2.setDueDate(LocalDateTime.now().plusDays(3)); // Friday
                        a2.setProblems(List.of(
                                new AssignmentProblem("chef-and-queries", "CODECHEF", "Chef and Queries", "Hard")
                        ));
                        dbAssignments.add(assignmentRepository.save(a2));

                        // Assignment 3: Sorting & Searching Fundamentals (with 2 problems)
                        Assignment a3 = new Assignment();
                        a3.setClassroom(classroom);
                        a3.setTitle("Sorting & Searching Fundamentals");
                        a3.setCategory("Fundamentals");
                        a3.setCreatedAt(LocalDateTime.now().minusDays(10));
                        a3.setDueDate(LocalDateTime.now().minusDays(3)); // Last Week
                        a3.setProblems(List.of(
                                new AssignmentProblem("find-duplicates-in-array", "GEEKSFORGEEKS", "Find Duplicates in Array", "Easy"),
                                new AssignmentProblem("reverse-a-linked-list", "GEEKSFORGEEKS", "Reverse a Linked List", "Easy")
                        ));
                        dbAssignments.add(assignmentRepository.save(a3));

                        // Assignment 4: Intro to System Design (with 1 problem)
                        Assignment a4 = new Assignment();
                        a4.setClassroom(classroom);
                        a4.setTitle("Intro to System Design");
                        a4.setCategory("Fundamentals");
                        a4.setCreatedAt(LocalDateTime.now().minusDays(30));
                        a4.setDueDate(LocalDateTime.now().minusDays(15)); // Oct 15 / past
                        a4.setProblems(List.of(
                                new AssignmentProblem("dynamic-array", "HACKERRANK", "Dynamic Array", "Medium")
                        ));
                        dbAssignments.add(assignmentRepository.save(a4));
                }

                List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(profile.getId());
                List<Map<String, Object>> response = new ArrayList<>();

                for (Assignment a : dbAssignments) {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id", a.getId());
                        map.put("title", a.getTitle());
                        map.put("description", a.getDescription());
                        map.put("category", a.getCategory());
                        map.put("totalMarks", a.getTotalMarks());
                        map.put("course", a.getClassroom().getName());
                        map.put("dueDate", formatDueDate(a.getDueDate()));

                        long totalProblems = a.getProblems().size();
                        long completedProblems = 0;
                        boolean hasAttemptedAny = false;
                        List<Map<String, Object>> problemsList = new ArrayList<>();

                        if (totalProblems > 0) {
                                for (AssignmentProblem p : a.getProblems()) {
                                        boolean hasValidAttempt = attempts.stream().anyMatch(att -> 
                                                problemIdsMatch(att.getProblemId(), p.getProblemId()) &&
                                                att.isCompleted() &&
                                                att.getTimestamp().isAfter(a.getCreatedAt()) &&
                                                att.getTimestamp().isBefore(a.getDueDate())
                                        );
                                        if (hasValidAttempt) {
                                                completedProblems++;
                                        }

                                        boolean attempted = attempts.stream().anyMatch(att -> 
                                                problemIdsMatch(att.getProblemId(), p.getProblemId())
                                        );
                                        if (attempted) {
                                                hasAttemptedAny = true;
                                        }

                                        Map<String, Object> pMap = new HashMap<>();
                                        pMap.put("problemId", p.getProblemId());
                                        pMap.put("platform", p.getPlatform());
                                        pMap.put("title", p.getTitle());
                                        pMap.put("difficulty", p.getDifficulty());
                                        pMap.put("completed", hasValidAttempt);
                                        pMap.put("url", p.getProblemUrl() != null && !p.getProblemUrl().isEmpty() ? p.getProblemUrl() : getProblemUrl(p.getPlatform(), p.getProblemId()));
                                        pMap.put("points", p.getPoints());
                                        pMap.put("problemOrder", p.getProblemOrder());
                                        problemsList.add(pMap);
                                }
                        }

                        boolean isCompleted = totalProblems > 0 && completedProblems == totalProblems;
                        int progress = totalProblems > 0 ? (int)((completedProblems * 100) / totalProblems) : 100;

                        map.put("status", isCompleted ? "completed" : "pending");
                        map.put("progress", isCompleted ? 100 : (progress > 0 ? progress : (hasAttemptedAny ? 30 : 0)));
                        map.put("color", isCompleted ? "emerald" : (progress > 0 ? "orange" : "blue"));
                        if (isCompleted) {
                                map.put("score", "100/100");
                        }
                        map.put("problems", problemsList);
                        response.add(map);
                }

                return ResponseEntity.ok(response);
        }

        private boolean problemIdsMatch(String attemptProblemId, String assignmentProblemId) {
                if (attemptProblemId == null || assignmentProblemId == null) {
                        return false;
                }
                return canonicalProblemId(attemptProblemId).equals(canonicalProblemId(assignmentProblemId));
        }

        private String canonicalProblemId(String problemId) {
                String normalized = problemId.toLowerCase().trim();
                normalized = normalized.replaceAll("^https?://[^/]+/(problems|challenges)/([^/?#]+).*$", "$2");
                normalized = normalized.replaceAll("^(leetcode|gfg|geeksforgeeks|codechef|hackerrank)[_-]+", "");
                normalized = normalized.replaceAll("[^a-z0-9]+", "-");
                normalized = normalized.replaceAll("^-+|-+$", "");
                return normalized;
        }

        private String getProblemUrl(String platform, String problemId) {
                if (platform == null || problemId == null) return "#";
                String cleanId = canonicalProblemId(problemId);
                switch (platform.toUpperCase()) {
                        case "LEETCODE":
                                return "https://leetcode.com/problems/" + cleanId + "/";
                        case "GEEKSFORGEEKS":
                                return "https://www.geeksforgeeks.org/problems/" + cleanId + "/";
                        case "CODECHEF":
                                return "https://www.codechef.com/problems/" + cleanId;
                        case "HACKERRANK":
                                return "https://www.hackerrank.com/challenges/" + cleanId;
                        default:
                                return "#";
                }
        }

        private String formatDueDate(LocalDateTime dueDate) {
                LocalDateTime now = LocalDateTime.now();
                if (dueDate.isBefore(now)) {
                        if (dueDate.isBefore(now.minusWeeks(1))) {
                                return dueDate.getMonth().name().substring(0, 3) + " " + dueDate.getDayOfMonth();
                        } else {
                                return "Last Week";
                        }
                } else if (dueDate.isBefore(now.plusDays(1).withHour(23).withMinute(59))) {
                        return "Tomorrow, 11:59 PM";
                } else if (dueDate.isBefore(now.plusDays(7))) {
                        return dueDate.getDayOfWeek().name().substring(0, 1) + 
                               dueDate.getDayOfWeek().name().substring(1).toLowerCase() + ", 11:59 PM";
                } else {
                        return dueDate.getMonth().name().substring(0, 3) + " " + dueDate.getDayOfMonth();
                }
        }

        @GetMapping("/leaderboard/{handle}")
        public ResponseEntity<List<Map<String, Object>>> getLeaderboard(@PathVariable String handle) {
                Optional<StudentProfile> profileOpt = studentProfileRepository.findByHandle(handle);
                if (profileOpt.isEmpty()) {
                        return ResponseEntity.ok(Collections.emptyList());
                }
                StudentProfile profile = profileOpt.get();

                List<Classroom> classrooms = classroomRepository.findByStudentId(profile.getId());
                if (classrooms.isEmpty()) {
                        Optional<Classroom> defaultClassOpt = classroomRepository.findByJoinCode("CS401X");
                        if (defaultClassOpt.isPresent()) {
                                Classroom defaultClassroom = defaultClassOpt.get();
                                defaultClassroom.getStudents().add(profile);
                                classroomRepository.save(defaultClassroom);
                                classrooms = List.of(defaultClassroom);
                        } else {
                                return ResponseEntity.ok(Collections.emptyList());
                        }
                }

                Set<StudentProfile> allStudents = new HashSet<>();
                for (Classroom c : classrooms) {
                        allStudents.addAll(c.getStudents());
                }

                List<Map<String, Object>> leaderboard = new ArrayList<>();
                for (StudentProfile sp : allStudents) {
                        List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(sp.getId());
                        long solved = attempts.stream().filter(ProblemAttempt::isCompleted).count();

                        if (solved == 0 && sp.getHandle().contains("_")) {
                                solved = 200;
                        }

                        long score = solved * 10;

                        String trend = "same";
                        if (sp.getHandle().equals("alice_chen") || sp.getHandle().equals("michael_chang") || sp.getHandle().equals(profile.getHandle())) {
                                trend = "up";
                        } else if (sp.getHandle().equals("david_miller") || sp.getHandle().equals("james_wilson")) {
                                trend = "down";
                        }

                        String avatar = "🦊";
                        if (sp.getHandle().equals("alice_chen")) avatar = "🐼";
                        else if (sp.getHandle().equals("david_miller")) avatar = "🦁";
                        else if (sp.getHandle().equals("sarah_jenkins")) avatar = "🐨";
                        else if (sp.getHandle().equals("michael_chang")) avatar = "🐯";
                        else if (sp.getHandle().equals("elena_rodriguez")) avatar = "🐰";
                        else if (sp.getHandle().equals("james_wilson")) avatar = "🐻";

                        double rating = 3.5 + Math.min(1.5, (solved / 350.0) * 1.5);
                        rating = Math.round(rating * 10.0) / 10.0;

                        Map<String, Object> map = new HashMap<>();
                        map.put("name", sp.getName());
                        map.put("handle", sp.getHandle());
                        map.put("prn", sp.getPrn());
                        map.put("rating", rating);
                        map.put("score", score);
                        map.put("problems", solved);
                        map.put("trend", trend);
                        map.put("avatar", avatar);

                        leaderboard.add(map);
                }

                leaderboard.sort((m1, m2) -> Long.compare((Long) m2.get("score"), (Long) m1.get("score")));

                for (int i = 0; i < leaderboard.size(); i++) {
                        leaderboard.get(i).put("rank", i + 1);
                }

                return ResponseEntity.ok(leaderboard);
        }

        @GetMapping("/rating-history/{handle}")
        public ResponseEntity<List<Map<String, Object>>> getRatingHistory(@PathVariable String handle) {
                Optional<StudentProfile> profileOpt = studentProfileRepository.findByHandle(handle);
                if (profileOpt.isEmpty()) {
                        return ResponseEntity.ok(Collections.emptyList());
                }
                StudentProfile profile = profileOpt.get();
                List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(profile.getId());
                long solvedCount = attempts.stream().filter(ProblemAttempt::isCompleted).count();

                String[] months = { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep" };
                long baseRating = 1200 + (solvedCount / 5);

                List<Map<String, Object>> ratingHistory = new ArrayList<>();
                long currentVal = baseRating - 400;
                for (int i = 0; i < months.length; i++) {
                        Map<String, Object> pt = new HashMap<>();
                        pt.put("name", months[i]);
                        if (i == 0) {
                                currentVal = baseRating - 400;
                        } else if (i == 2) {
                                currentVal -= 50;
                        } else if (i == 5) {
                                currentVal -= 50;
                        } else {
                                currentVal += 80 + (i * 10);
                        }
                        pt.put("uv", Math.max(1000, currentVal));
                        ratingHistory.add(pt);
                }

                return ResponseEntity.ok(ratingHistory);
        }

        @GetMapping("/teacher/summary")
        public ResponseEntity<Map<String, Object>> getTeacherSummary(@RequestParam String email) {
                Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);
                if (teacherOpt.isEmpty()) {
                        teacherOpt = teacherRepository.findByEmail("teacher@example.com");
                }

                Map<String, Object> summary = new HashMap<>();
                if (teacherOpt.isEmpty()) {
                        summary.put("classroomsCount", 0);
                        summary.put("assignmentsCount", 0);
                        summary.put("activeAssignmentsCount", 0);
                        summary.put("pendingSubmissionsCount", 0);
                        summary.put("activeTodayCount", 0);
                        summary.put("averageSolveRate", 82);
                        summary.put("latestAssignment", null);
                        summary.put("activities", Collections.emptyList());
                        summary.put("alerts", Collections.emptyList());
                        return ResponseEntity.ok(summary);
                }

                Teacher teacher = teacherOpt.get();
                List<Classroom> classrooms = classroomRepository.findByTeacherId(teacher.getId(), org.springframework.data.domain.PageRequest.of(0, 1000)).getContent();

                List<Long> classroomIds = classrooms.stream().map(Classroom::getId).toList();
                List<Assignment> assignments = classroomIds.isEmpty() ? Collections.emptyList() : assignmentRepository.findByClassroomIdIn(classroomIds);

                long activeAssignmentsCount = assignments.stream()
                                .filter(a -> a.getDueDate().isAfter(LocalDateTime.now())).count();

                long totalAssigned = 0;
                long totalSolved = 0;
                int pendingSubmissionsCount = 0;

                for (Classroom c : classrooms) {
                        List<Assignment> classroomAssignments = assignments.stream()
                                        .filter(a -> a.getClassroom().getId().equals(c.getId())).toList();
                        for (Assignment a : classroomAssignments) {
                                long studentCount = c.getStudents().size();
                                long problemCount = a.getProblems().size();
                                totalAssigned += studentCount * problemCount;

                                for (StudentProfile sp : c.getStudents()) {
                                        List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(sp.getId());
                                        for (AssignmentProblem ap : a.getProblems()) {
                                                boolean completed = attempts.stream().anyMatch(att ->
                                                        problemIdsMatch(att.getProblemId(), ap.getProblemId()) && att.isCompleted()
                                                );
                                                if (completed) {
                                                        totalSolved++;
                                                } else {
                                                        pendingSubmissionsCount++;
                                                }
                                        }
                                }
                        }
                }

                int avgSolveRatePercent = totalAssigned > 0 ? (int) Math.round(((double) totalSolved / totalAssigned) * 100) : 82;

                LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
                Set<Long> activeStudentIds = new HashSet<>();
                for (Classroom c : classrooms) {
                        for (StudentProfile sp : c.getStudents()) {
                                boolean active = problemAttemptRepository.findByStudentProfileId(sp.getId()).stream()
                                                .anyMatch(att -> att.getTimestamp().isAfter(startOfToday));
                                if (active) {
                                        activeStudentIds.add(sp.getId());
                                }
                        }
                }

                List<ProblemAttempt> allAttempts = new ArrayList<>();
                for (Classroom c : classrooms) {
                        for (StudentProfile sp : c.getStudents()) {
                                allAttempts.addAll(problemAttemptRepository.findByStudentProfileId(sp.getId()));
                        }
                }
                allAttempts.sort((a1, a2) -> a2.getTimestamp().compareTo(a1.getTimestamp()));
                List<ProblemAttempt> recentAttempts = allAttempts.stream().limit(10).toList();

                List<Map<String, Object>> activities = new ArrayList<>();
                for (ProblemAttempt att : recentAttempts) {
                        Map<String, Object> act = new HashMap<>();
                        act.put("id", att.getId());
                        act.put("student", att.getStudentProfile().getName());
                        act.put("handle", att.getStudentProfile().getHandle());
                        String actionWord = att.isCompleted() ? "solved" : "attempted";
                        act.put("action", actionWord + " \"" + getProblemTitle(att) + "\" on " + att.getPlatform());
                        act.put("time", formatTimeAgo(att.getTimestamp()));
                        activities.add(act);
                }

                List<Map<String, Object>> alerts = new ArrayList<>();
                long alertId = 1;

                if (!classrooms.isEmpty() && !assignments.isEmpty()) {
                        Assignment latest = assignments.stream()
                                        .max(Comparator.comparing(Assignment::getCreatedAt))
                                        .orElse(null);
                        if (latest != null) {
                                int notStartedCount = 0;
                                Classroom c = latest.getClassroom();
                                for (StudentProfile sp : c.getStudents()) {
                                        List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(sp.getId());
                                        boolean started = false;
                                        for (AssignmentProblem ap : latest.getProblems()) {
                                                if (attempts.stream().anyMatch(att -> problemIdsMatch(att.getProblemId(), ap.getProblemId()))) {
                                                        started = true;
                                                        break;
                                                }
                                        }
                                        if (!started) {
                                                notStartedCount++;
                                        }
                                }
                                if (notStartedCount > 0) {
                                        Map<String, Object> alert = new HashMap<>();
                                        alert.put("id", alertId++);
                                        alert.put("type", "warning");
                                        alert.put("text", notStartedCount + " students have not started their latest assignment: \"" + latest.getTitle() + "\"");
                                        alerts.add(alert);
                                }
                        }
                }

                LocalDateTime now = LocalDateTime.now();
                List<Assignment> overdueAssignments = assignments.stream()
                                .filter(a -> a.getDueDate().isBefore(now)).toList();
                for (Assignment a : overdueAssignments) {
                        int overdueCount = 0;
                        Classroom c = a.getClassroom();
                        for (StudentProfile sp : c.getStudents()) {
                                List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(sp.getId());
                                boolean completedAll = true;
                                for (AssignmentProblem ap : a.getProblems()) {
                                        boolean solvedProblem = attempts.stream().anyMatch(att -> 
                                                problemIdsMatch(att.getProblemId(), ap.getProblemId()) && att.isCompleted()
                                        );
                                        if (!solvedProblem) {
                                                completedAll = false;
                                                break;
                                        }
                                }
                                if (!completedAll) {
                                        overdueCount++;
                                }
                        }
                        if (overdueCount > 0) {
                                Map<String, Object> alert = new HashMap<>();
                                alert.put("id", alertId++);
                                alert.put("type", "error");
                                alert.put("text", overdueCount + " overdue submissions in " + a.getClassroom().getName() + " for \"" + a.getTitle() + "\"");
                                alerts.add(alert);
                        }
                }

                for (Classroom c : classrooms) {
                        for (StudentProfile sp : c.getStudents()) {
                                double rating = getStudentRating(sp);
                                if (rating < 4.0) {
                                        Map<String, Object> alert = new HashMap<>();
                                        alert.put("id", alertId++);
                                        alert.put("type", "info");
                                        alert.put("text", "Low performance alert: Student " + sp.getName() + " (@" + sp.getHandle() + ") rating is " + rating);
                                        alerts.add(alert);
                                }
                        }
                }

                Map<String, Object> latestAssignmentMap = null;
                if (!assignments.isEmpty()) {
                        Assignment latest = assignments.stream()
                                        .max(Comparator.comparing(Assignment::getCreatedAt))
                                        .orElse(null);
                        if (latest != null) {
                                latestAssignmentMap = new HashMap<>();
                                latestAssignmentMap.put("title", latest.getTitle());
                                latestAssignmentMap.put("dueDate", formatDueDate(latest.getDueDate()));
                                
                                long totalStudents = latest.getClassroom().getStudents().size();
                                long completedCount = 0;
                                for (StudentProfile sp : latest.getClassroom().getStudents()) {
                                        List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(sp.getId());
                                        boolean completedAll = true;
                                        for (AssignmentProblem ap : latest.getProblems()) {
                                                boolean solvedProblem = attempts.stream().anyMatch(att -> 
                                                        problemIdsMatch(att.getProblemId(), ap.getProblemId()) && att.isCompleted()
                                                );
                                                if (!solvedProblem) {
                                                        completedAll = false;
                                                        break;
                                                }
                                        }
                                        if (completedAll) {
                                                completedCount++;
                                        }
                                }
                                int progressPercent = totalStudents > 0 ? (int) Math.round(((double) completedCount / totalStudents) * 100) : 100;
                                latestAssignmentMap.put("progress", progressPercent);
                                latestAssignmentMap.put("completedCount", completedCount);
                                latestAssignmentMap.put("totalStudents", totalStudents);
                        }
                }

                summary.put("classroomsCount", classrooms.size());
                summary.put("assignmentsCount", assignments.size());
                summary.put("activeAssignmentsCount", activeAssignmentsCount);
                summary.put("pendingSubmissionsCount", pendingSubmissionsCount);
                summary.put("activeTodayCount", activeStudentIds.size());
                summary.put("averageSolveRate", avgSolveRatePercent);
                summary.put("strugglingStudentsCount", calculateStrugglingStudents(classrooms));
                summary.put("latestAssignment", latestAssignmentMap);
                summary.put("activities", activities);
                alerts.addAll(buildStrugglingStudentAlerts(classrooms, alertId));
                summary.put("alerts", alerts);

                return ResponseEntity.ok(summary);
        }

        private long calculateStrugglingStudents(List<Classroom> classrooms) {
                Set<Long> strugglingStudentIds = new HashSet<>();

                for (Classroom classroom : classrooms) {
                        for (StudentProfile student : classroom.getStudents()) {
                                List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(student.getId());
                                boolean struggling = attempts.stream()
                                                .anyMatch(a -> !a.isCompleted() && a.getHintsUsed() >= 3);
                                if (struggling) {
                                        strugglingStudentIds.add(student.getId());
                                }
                        }
                }

                return strugglingStudentIds.size();
        }

        private List<Map<String, Object>> buildStrugglingStudentAlerts(List<Classroom> classrooms, long startId) {
                List<Map<String, Object>> hintAlerts = new ArrayList<>();
                Set<Long> processed = new HashSet<>();
                long alertId = startId;

                for (Classroom classroom : classrooms) {
                        for (StudentProfile student : classroom.getStudents()) {
                                if (!processed.add(student.getId())) {
                                        continue;
                                }

                                List<ProblemAttempt> attempts = problemAttemptRepository.findByStudentProfileId(student.getId());
                                Optional<ProblemAttempt> topStruggle = attempts.stream()
                                                .filter(a -> !a.isCompleted() && a.getHintsUsed() >= 3)
                                                .max(Comparator.comparingInt(ProblemAttempt::getHintsUsed));

                                if (topStruggle.isPresent()) {
                                        ProblemAttempt attempt = topStruggle.get();
                                        Map<String, Object> alert = new HashMap<>();
                                        alert.put("id", alertId++);
                                        alert.put("type", "warning");
                                        alert.put("text", student.getName() + " used " + attempt.getHintsUsed()
                                                        + " hints on " + getProblemTitle(attempt)
                                                        + ". Consider checking in.");
                                        hintAlerts.add(alert);
                                }
                        }
                }

                return hintAlerts.stream().limit(5).toList();
        }

        private double getStudentRating(StudentProfile sp) {
                if (sp.getHandle().equals("alice_chen")) return 4.9;
                if (sp.getHandle().equals("david_miller")) return 4.5;
                if (sp.getHandle().equals("sarah_jenkins")) return 4.3;
                if (sp.getHandle().equals("michael_chang")) return 4.1;
                if (sp.getHandle().equals("elena_rodriguez")) return 4.0;
                if (sp.getHandle().equals("james_wilson")) return 3.8;
                return 3.5;
        }

        private String getProblemTitle(ProblemAttempt att) {
                String name = att.getProblemId();
                if (name == null) return "Unknown Problem";
                name = name.replaceAll("^(leetcode|gfg|codechef|hackerrank)_", "");
                name = name.replace('-', ' ').replace('_', ' ');
                String[] words = name.split(" ");
                StringBuilder sb = new StringBuilder();
                for (String w : words) {
                        if (!w.isEmpty()) {
                                sb.append(Character.toUpperCase(w.charAt(0))).append(w.substring(1)).append(" ");
                        }
                }
                return sb.toString().trim();
        }

        private String formatTimeAgo(LocalDateTime timestamp) {
                java.time.Duration duration = java.time.Duration.between(timestamp, LocalDateTime.now());
                long seconds = duration.getSeconds();
                if (seconds < 60) {
                        return "Just now";
                }
                long minutes = seconds / 60;
                if (minutes < 60) {
                        return minutes + "m ago";
                }
                long hours = minutes / 60;
                if (hours < 24) {
                        return hours + "h ago";
                }
                long days = hours / 24;
                return days + "d ago";
        }
}
