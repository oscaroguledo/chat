package com.chatapp.websocket;

import lombok.Data;

import java.util.UUID;

@Data
public class TypingEvent {
    private UUID chatId;
    private boolean typing;
}
