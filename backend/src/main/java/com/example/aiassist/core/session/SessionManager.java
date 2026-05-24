package com.example.aiassist.core.session;

import com.example.aiassist.core.session.SessionState;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionManager {

    private final Map<String, SessionState> sessions = new ConcurrentHashMap<>();

    public SessionState getSession(String sessionId) {
        return sessions.computeIfAbsent(sessionId, SessionState::new);
    }
}
