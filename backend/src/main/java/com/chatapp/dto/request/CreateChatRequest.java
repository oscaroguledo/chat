package com.chatapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateChatRequest {
    @NotBlank
    private String type; // "direct" or "group"
    private String name;
    private String description;
    @NotEmpty
    private List<UUID> participantIds;
}
