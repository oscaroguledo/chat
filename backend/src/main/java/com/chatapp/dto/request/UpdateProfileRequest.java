package com.chatapp.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @Size(min = 2, max = 100)
    private String name;
    @Size(max = 500)
    private String bio;
    private String status;
}
