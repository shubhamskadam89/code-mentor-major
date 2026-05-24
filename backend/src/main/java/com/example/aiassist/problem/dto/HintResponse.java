package com.example.aiassist.problem.dto;

import jdk.jfr.Name;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class HintResponse {

    public  boolean showHint;
    public  String level;
    public String message;



    public static HintResponse noHint() {
        return new HintResponse(false,null ,null);
    }

    public static HintResponse from(Hint hint) {
        return new HintResponse(true,hint.getLevel(),hint.getMessage());
    }

    public boolean isShowHint() { return showHint; }
    public String getLevel() { return level; }
    public String getMessage() { return message; }
}