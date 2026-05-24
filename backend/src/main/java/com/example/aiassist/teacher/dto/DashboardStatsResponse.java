package com.example.aiassist.teacher.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {

    private String studentName;
    private String handle;
    private int totalActiveDays;
    private int maxStreak;
    private int currentStreak;

    private int classTestsTaken;
    private double avgTestScore;

    private List<Map<String, Object>> assignmentsStatus;
    private List<Map<String, Object>> fundamentalsStats;
    private List<Map<String, Object>> dsaStats;

    public DashboardStatsResponse() {
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {
        this.handle = handle;
    }

    public int getTotalActiveDays() {
        return totalActiveDays;
    }

    public void setTotalActiveDays(int totalActiveDays) {
        this.totalActiveDays = totalActiveDays;
    }

    public int getMaxStreak() {
        return maxStreak;
    }

    public void setMaxStreak(int maxStreak) {
        this.maxStreak = maxStreak;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public int getClassTestsTaken() {
        return classTestsTaken;
    }

    public void setClassTestsTaken(int classTestsTaken) {
        this.classTestsTaken = classTestsTaken;
    }

    public double getAvgTestScore() {
        return avgTestScore;
    }

    public void setAvgTestScore(double avgTestScore) {
        this.avgTestScore = avgTestScore;
    }

    public List<Map<String, Object>> getAssignmentsStatus() {
        return assignmentsStatus;
    }

    public void setAssignmentsStatus(List<Map<String, Object>> assignmentsStatus) {
        this.assignmentsStatus = assignmentsStatus;
    }

    public List<Map<String, Object>> getFundamentalsStats() {
        return fundamentalsStats;
    }

    public void setFundamentalsStats(List<Map<String, Object>> fundamentalsStats) {
        this.fundamentalsStats = fundamentalsStats;
    }

    public List<Map<String, Object>> getDsaStats() {
        return dsaStats;
    }

    public void setDsaStats(List<Map<String, Object>> dsaStats) {
        this.dsaStats = dsaStats;
    }
}
