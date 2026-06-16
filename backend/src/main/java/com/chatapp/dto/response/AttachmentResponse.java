package com.chatapp.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AttachmentResponse {
    private UUID id;
    private String fileName;
    private Long fileSize;
    private String mimeType;
    private String url;
    private String thumbnailUrl;
    private Integer duration;
    private Integer width;
    private Integer height;
}
