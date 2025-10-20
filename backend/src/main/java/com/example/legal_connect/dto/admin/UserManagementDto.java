package com.example.legal_connect.dto.admin;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserManagementDto {
    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private String avatar;
    private String role;
    private String authProvider;
    private Boolean isEmailVerified;
    private Boolean isEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer postsCount;
    private Integer messagesCount;
}