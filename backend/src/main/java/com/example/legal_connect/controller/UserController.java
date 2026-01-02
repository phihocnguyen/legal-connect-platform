package com.example.legal_connect.controller;

import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.dto.user.UpdateProfileRequest;
import com.example.legal_connect.dto.user.UserProfileDto;
import com.example.legal_connect.dto.user.UserPostDto;
import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User", description = "User management APIs")
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    @Operation(summary = "Get user profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getUserProfile(@PathVariable Long userId) {
        try {
            UserProfileDto profile = userService.getUserProfile(userId);
            return ResponseEntity.ok(ApiResponse.<UserProfileDto>builder()
                    .success(true)
                    .message("User profile retrieved successfully")
                    .data(profile)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error getting user profile: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<UserProfileDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @PutMapping("/{userId}")
    @Operation(summary = "Update user profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        try {
            // Security check: Ensure user can only update their own profile
            Long currentUserId = getUserIdFromAuthentication(authentication);
            if (!userId.equals(currentUserId)) {
                log.warn("User {} attempted to update profile of user {}", currentUserId, userId);
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(ApiResponse.<UserProfileDto>builder()
                                .success(false)
                                .message("You can only update your own profile")
                                .build());
            }
            
            UserProfileDto updatedProfile = userService.updateProfile(userId, request);
            return ResponseEntity.ok(ApiResponse.<UserProfileDto>builder()
                    .success(true)
                    .message("User profile updated successfully")
                    .data(updatedProfile)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error updating user profile: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<UserProfileDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @GetMapping("/{userId}/posts")
    @Operation(summary = "Get user posts")
    public ResponseEntity<ApiResponse<Page<UserPostDto>>> getUserPosts(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        try {
            Page<UserPostDto> posts = userService.getUserPosts(userId, pageable);
            return ResponseEntity.ok(ApiResponse.<Page<UserPostDto>>builder()
                    .success(true)
                    .message("User posts retrieved successfully")
                    .data(posts)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error getting user posts: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<Page<UserPostDto>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }
    
    /**
     * Helper method to get current user ID from authentication
     */
    private Long getUserIdFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserPrincipal) {
            return ((UserPrincipal) principal).getId();
        }
        
        throw new RuntimeException("Invalid authentication principal");
    }
}
