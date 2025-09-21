package com.example.legal_connect.dto.conversation;

import com.example.legal_connect.entity.Conversation.ConversationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {
    
    @NotNull(message = "Conversation type is required")
    private ConversationType type;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String summary;
    
    private String initialMessage;
}