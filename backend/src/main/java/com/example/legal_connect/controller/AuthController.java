package com.example.legal_connect.controller;

import com.example.legal_connect.dto.auth.AuthResponse;
import com.example.legal_connect.dto.auth.LoginRequest;
import com.example.legal_connect.dto.auth.RegisterRequest;
import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.mapper.AuthMapper;
import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.AuthService;
import com.example.legal_connect.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication management APIs")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final AuthMapper authMapper;

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = authService.register(request);
            return ResponseEntity.ok(authMapper.toSuccessResponse(user, "User registered successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(authMapper.toAuthErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    @Operation(summary = "User login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            User user = authService.login(request, httpRequest);
            return ResponseEntity.ok(authMapper.toSuccessResponse(user, "Login successful"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(authMapper.toAuthErrorResponse("Invalid email or password"));
        }
    }

    @PostMapping("/logout")
    @Operation(summary = "User logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(authMapper.toSuccessMessageResponse("Logout successful"));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user")
    public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(authMapper.toAuthErrorResponse("User not authenticated"));
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userService.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(authMapper.toSuccessResponse(user));
    }

    @GetMapping("/status")
    @Operation(summary = "Check authentication status")
    public ResponseEntity<ApiResponse<String>> getAuthStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && 
            !authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.ok(authMapper.toSuccessMessageResponse("User is authenticated"));
        }
        
        return ResponseEntity.ok(authMapper.toSuccessMessageResponse("User is not authenticated"));
    }
}
