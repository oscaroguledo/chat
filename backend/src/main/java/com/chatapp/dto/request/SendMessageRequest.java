package com.chatapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class SendMessageRequest {
    @NotBlank
    private String type; // text | image | video | audio | file
    private String content;
    private UUID replyToId;
}
