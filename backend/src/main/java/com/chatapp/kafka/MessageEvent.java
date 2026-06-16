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
public class MessageEvent {
    private String eventType;  // MESSAGE_SENT | MESSAGE_UPDATED | MESSAGE_DELETED | REACTION_UPDATED
    private UUID chatId;
    private UUID messageId;
    private UUID senderId;
    private Object payload;
    private Instant timestamp;
}
