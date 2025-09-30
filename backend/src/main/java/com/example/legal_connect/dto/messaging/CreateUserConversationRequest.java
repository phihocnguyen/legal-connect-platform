package com.example.legal_connect.dto.messaging;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserConversationRequest {
    
    @NotNull(message = "User ID is required")
    private Long otherUserId;
}