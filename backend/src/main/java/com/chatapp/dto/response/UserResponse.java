package com.chatapp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private UUID id;
    private String name;
    private String email;
    private String avatarUrl;
    private String bio;
    private String status;
    private Instant lastSeen;
    private Instant createdAt;
}
