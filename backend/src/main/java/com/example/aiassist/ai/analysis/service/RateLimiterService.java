package com.example.aiassist.ai.analysis.service;

import com.example.aiassist.common.exception.RateLimitException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimiterService {

    // Maps user identifier to the timestamp (in milliseconds) of their last successful request
    private final ConcurrentHashMap<String, Long> lastRequestTimes = new ConcurrentHashMap<>();

    @Value("${app.rate-limit.enabled:true}")
    private boolean enabled;

    @Value("${app.rate-limit.cooldown-seconds:120}") // Default 120 seconds (2 minutes)
    private long cooldownSeconds;

    public void checkRateLimit(String userId) {
        if (!enabled) {
            return;
        }

        if (userId == null || userId.isBlank()) {
            return; // If no identifier is found, bypass the rate limit
        }

        long now = System.currentTimeMillis();
        Long lastRequestTime = lastRequestTimes.get(userId);

        if (lastRequestTime != null) {
            long elapsed = now - lastRequestTime;
            long cooldownMs = cooldownSeconds * 1000;
            if (elapsed < cooldownMs) {
                long remainingSeconds = (cooldownMs - elapsed) / 1000;
                throw new RateLimitException("Too many requests. Please wait " + remainingSeconds + " seconds before requesting another hint.");
            }
        }

        // Update the last request timestamp
        lastRequestTimes.put(userId, now);
    }
}
