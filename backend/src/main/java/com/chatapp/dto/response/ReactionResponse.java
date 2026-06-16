package com.chatapp.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class ReactionResponse {
    private String emoji;
    private List<UUID> userIds;
    private int count;
}
