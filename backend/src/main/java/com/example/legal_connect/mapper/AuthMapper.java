package com.example.legal_connect.mapper;

import com.example.legal_connect.dto.auth.RegisterRequest;
import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.dto.auth.AuthResponse;
import com.example.legal_connect.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthMapper {

    private final UserMapper userMapper;

    public ApiResponse<AuthResponse> toSuccessResponse(User user, String message) {
        AuthResponse authResponse = userMapper.toAuthResponse(user);
        return ApiResponse.success(message, authResponse);
    }

    public ApiResponse<AuthResponse> toSuccessResponse(User user) {
        AuthResponse authResponse = userMapper.toAuthResponse(user);
        return ApiResponse.success(authResponse);
    }

    public ApiResponse<String> toErrorResponse(String message) {
        return ApiResponse.error(message);
    }

    public ApiResponse<AuthResponse> toAuthErrorResponse(String message) {
        return ApiResponse.error(message);
    }

    public ApiResponse<String> toSuccessMessageResponse(String message) {
        return ApiResponse.success(message);
    }

    public User createUserFromRegisterRequest(RegisterRequest request, String encodedPassword) {
        User user = userMapper.toEntity(request);
        user.setPassword(encodedPassword);
        return user;
    }
}
