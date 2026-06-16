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
public class MessageResponse {
    private UUID id;
    private UUID chatId;
    private UserResponse sender;
    private String type;
    private String content;
    private UUID replyToId;
    private MessageResponse replyTo;
    private boolean edited;
    private boolean deleted;
    private List<AttachmentResponse> attachments;
    private List<ReactionResponse> reactions;
    private List<UUID> readBy;
    private Instant createdAt;
    private Instant updatedAt;
}
