package com.example.legal_connect.mapper;

import com.example.legal_connect.dto.auth.AuthResponse;
import com.example.legal_connect.dto.auth.RegisterRequest;
import com.example.legal_connect.entity.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public User toEntity(RegisterRequest registerRequest) {
        if (registerRequest == null) {
            return null;
        }

        return User.builder()
                .email(registerRequest.getEmail())
                .fullName(registerRequest.getFullName())
                .phoneNumber(registerRequest.getPhoneNumber())
                .role(User.Role.USER)
                .authProvider(User.AuthProvider.LOCAL)
                .isEmailVerified(false)
                .isEnabled(true)
                .build();
    }

    public AuthResponse toAuthResponse(User user) {
        if (user == null) {
            return null;
        }

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .authProvider(user.getAuthProvider())
                .build();
    }

    public User createOAuth2User(String email, String name, String providerId) {
        return User.builder()
                .email(email)
                .fullName(name)
                .role(User.Role.USER)
                .authProvider(User.AuthProvider.GOOGLE)
                .providerId(providerId)
                .isEmailVerified(true)
                .isEnabled(true)
                .build();
    }

    public void updateUserFromOAuth2(User existingUser, String name, String providerId) {
        if (existingUser.getAuthProvider() == User.AuthProvider.LOCAL) {
            existingUser.setAuthProvider(User.AuthProvider.GOOGLE);
            existingUser.setProviderId(providerId);
            existingUser.setIsEmailVerified(true);
        }
        if (name != null && !name.isEmpty()) {
            existingUser.setFullName(name);
        }
    }
}
