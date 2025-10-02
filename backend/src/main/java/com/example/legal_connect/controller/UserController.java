package com.example.legal_connect.controller;

import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.dto.user.UserProfileDto;
import com.example.legal_connect.dto.user.UserPostDto;
import com.example.legal_connect.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User", description = "User management APIs")
@CrossOrigin(origins = {"http://localhost:3000"})
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

    @GetMapping("/{userId}/posts")
    @Operation(summary = "Get user posts")
    public ResponseEntity<Page<UserPostDto>> getUserPosts(
            @PathVariable Long userId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        try {
            Page<UserPostDto> posts = userService.getUserPosts(userId, pageable);
            return ResponseEntity.ok(posts);
        } catch (RuntimeException e) {
            log.error("Error getting user posts: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}
