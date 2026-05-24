package com.example.aiassist.core.session;

import com.example.aiassist.signal.model.ApproachType;

public class SessionState {

    private final String sessionId;
    private ApproachType lastDetectedApproach;
    private long lastHintTimestamp;
    private int sameMistakeCount;

    public SessionState(String sessionId) {
        this.sessionId = sessionId;
        this.sameMistakeCount = 0;
        this.lastHintTimestamp = 0L;
        this.lastDetectedApproach = null;
    }

    public String getSessionId() {
        return sessionId;
    }

    public ApproachType getLastDetectedApproach() {
        return lastDetectedApproach;
    }

    public void setLastDetectedApproach(ApproachType lastDetectedApproach) {
        this.lastDetectedApproach = lastDetectedApproach;
    }

    public long getLastHintTimestamp() {
        return lastHintTimestamp;
    }

    public void setLastHintTimestamp(long lastHintTimestamp) {
        this.lastHintTimestamp = lastHintTimestamp;
    }

    public int getSameMistakeCount() {
        return sameMistakeCount;
    }

    public void incrementMistake() {
        this.sameMistakeCount++;
    }

    public void resetMistakes() {
        this.sameMistakeCount = 0;
    }
}
