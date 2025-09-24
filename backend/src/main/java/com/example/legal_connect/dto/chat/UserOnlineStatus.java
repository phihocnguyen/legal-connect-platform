package com.example.legal_connect.dto.chat;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserOnlineStatus {
    private String userId;
    private String userName;
    private String userType;
    private String avatar;
    private boolean online;
    private LocalDateTime lastSeen;
    private String sessionId;
}