package com.example.aiassist.classroom.entity;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AssignmentProblem {
    private String problemId; // e.g. "leetcode_1" or "two-sum"
    private String platform;   // e.g. "LEETCODE", "GEEKSFORGEEKS"
    private String title;      // e.g. "Two Sum"
    private String difficulty; // "Easy", "Medium", "Hard"
    private String problemUrl; // direct problem url e.g. https://leetcode.com/problems/two-sum/
    private int points;
    private int problemOrder;
    public AssignmentProblem(String problemId, String platform, String title, String difficulty) {
        this.problemId = problemId;
        this.platform = platform;
        this.title = title;
        this.difficulty = difficulty;
        this.problemUrl = "";
        this.points = 0;
        this.problemOrder = 0;
    }
}
