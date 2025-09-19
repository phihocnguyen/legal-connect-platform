package com.example.legal_connect.dto.auth;

import com.example.legal_connect.entity.User;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Authentication response")
public class AuthResponse {
    
    @Schema(description = "User ID", example = "1")
    private Long id;
    
    @Schema(description = "User email", example = "user@example.com")
    private String email;
    
    @Schema(description = "User full name", example = "John Doe")
    private String fullName;
    
    @Schema(description = "User phone number", example = "0123456789")
    private String phoneNumber;
    
    @Schema(description = "User avatar URL")
    private String avatar;
    
    @Schema(description = "User role", example = "USER")
    private User.Role role;
    
    @Schema(description = "Authentication provider", example = "LOCAL")
    private User.AuthProvider authProvider;
    
    public static AuthResponse fromUser(User user) {
        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .avatar(user.getAvatar())
                .role(user.getRole())
                .authProvider(user.getAuthProvider())
                .build();
    }
}
