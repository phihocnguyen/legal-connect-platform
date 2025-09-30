package com.example.legal_connect.dto.messaging;

import com.example.legal_connect.entity.User.Role;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserConversationDto {
    private Long id;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantDto {
        private Long id;
        private String name;
        private String email;
        private String avatar;
        private Role role;
        private Boolean online;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LastMessageDto {
        private String content;
        private LocalDateTime timestamp;
        private Long senderId;
    }
    
    private ParticipantDto participant;
    private LastMessageDto lastMessage;
    private Integer unreadCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}