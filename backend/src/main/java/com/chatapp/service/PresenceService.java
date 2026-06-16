package com.chatapp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PresenceService {

    private static final String KEY_PREFIX = "presence:";
    private static final Duration TTL = Duration.ofMinutes(5);

    private final StringRedisTemplate redis;

    public void markOnline(UUID userId) {
        redis.opsForValue().set(KEY_PREFIX + userId, "online", TTL);
    }

    public void markOffline(UUID userId) {
        redis.delete(KEY_PREFIX + userId);
    }

    public boolean isOnline(UUID userId) {
        return Boolean.TRUE.equals(redis.hasKey(KEY_PREFIX + userId));
    }

    public String getStatus(UUID userId) {
        String val = redis.opsForValue().get(KEY_PREFIX + userId);
        return val != null ? val : "offline";
    }
}
