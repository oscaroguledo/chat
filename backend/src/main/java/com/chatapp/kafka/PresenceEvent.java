package com.chatapp.kafka;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PresenceEvent {
    private String eventType; // USER_ONLINE | USER_OFFLINE
    private UUID userId;
    private String status;
    private Instant timestamp;
}
