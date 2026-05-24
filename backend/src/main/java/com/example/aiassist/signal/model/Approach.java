package com.example.aiassist.signal.model;

import com.example.aiassist.signal.model.ApproachType;

public class Approach {

    private final ApproachType type;

    public Approach(ApproachType type) {
        this.type = type;
    }

    public ApproachType getType() {
        return type;
    }
}
