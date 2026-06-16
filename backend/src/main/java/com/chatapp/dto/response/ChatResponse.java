package com.chatapp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatResponse {
    private UUID id;
    private String type;
    private String name;
    private String description;
    private String avatarUrl;
    private UserResponse createdBy;
    private List<ParticipantResponse> participants;
    private MessageResponse lastMessage;
    private int unreadCount;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ParticipantResponse {
        private UUID id;
        private String name;
        private String email;
        private String avatarUrl;
        private String status;
        private String role;
    }
}
