package com.chatapp.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddReactionRequest {
    @NotBlank
    private String emoji;
}
