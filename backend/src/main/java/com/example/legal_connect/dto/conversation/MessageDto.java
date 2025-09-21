package com.example.legal_connect.dto.conversation;

import com.example.legal_connect.entity.Message.MessageRole;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private Long conversationId;
    private String content;
    private MessageRole role;
    private LocalDateTime createdAt;
}