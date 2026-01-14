package com.example.legal_connect.controller;

import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.dto.forum.BookmarkDto;
import com.example.legal_connect.dto.forum.PostDto;
import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://legal-connect-prod-alb-790910672.ap-southeast-1.elb.amazonaws.com"})
public class BookmarkController {

    private final BookmarkService bookmarkService;

    /**
     * Toggle bookmark for a post
     */
    @PostMapping("/posts/{postId}/bookmark")
    @Operation(summary = "Toggle bookmark for a post")
    public ResponseEntity<ApiResponse<BookmarkDto>> toggleBookmark(
            @PathVariable Long postId,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            log.info("Toggle bookmark for post {} by user {}", postId, userId);
            BookmarkDto bookmarkDto = bookmarkService.toggleBookmark(postId, userId);
            
            return ResponseEntity.ok(ApiResponse.<BookmarkDto>builder()
                    .success(true)
                    .message(bookmarkDto.getIsBookmarked() ? "Post bookmarked successfully" : "Bookmark removed successfully")
                    .data(bookmarkDto)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error toggling bookmark: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<BookmarkDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        } catch (Exception e) {
            log.error("Unexpected error toggling bookmark: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.<BookmarkDto>builder()
                            .success(false)
                            .message("An unexpected error occurred")
                            .build());
        }
    }

    /**
     * Get bookmark status for a post
     */
    @GetMapping("/posts/{postId}/bookmark")
    @Operation(summary = "Get bookmark status for a post")
    public ResponseEntity<ApiResponse<BookmarkDto>> getBookmarkStatus(
            @PathVariable Long postId,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            BookmarkDto bookmarkDto = bookmarkService.getBookmarkStatus(postId, userId);
            
            return ResponseEntity.ok(ApiResponse.<BookmarkDto>builder()
                    .success(true)
                    .message("Bookmark status retrieved successfully")
                    .data(bookmarkDto)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error getting bookmark status: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<BookmarkDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * Get all bookmarked posts for current user
     */
    @GetMapping("/bookmarks")
    @Operation(summary = "Get all bookmarked posts for current user")
    public ResponseEntity<ApiResponse<Page<PostDto>>> getUserBookmarks(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            Authentication authentication) {
        try {
            Long userId = getUserIdFromAuthentication(authentication);
            Page<PostDto> bookmarks = bookmarkService.getUserBookmarks(userId, pageable);
            
            return ResponseEntity.ok(ApiResponse.<Page<PostDto>>builder()
                    .success(true)
                    .message("Bookmarked posts retrieved successfully")
                    .data(bookmarks)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error getting user bookmarks: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<Page<PostDto>>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    /**
     * Get bookmark count for a post (public endpoint)
     */
    @GetMapping("/posts/{postId}/bookmark/count")
    @Operation(summary = "Get bookmark count for a post")
    public ResponseEntity<ApiResponse<Long>> getBookmarkCount(@PathVariable Long postId) {
        try {
            long count = bookmarkService.getBookmarkCount(postId);
            
            return ResponseEntity.ok(ApiResponse.<Long>builder()
                    .success(true)
                    .message("Bookmark count retrieved successfully")
                    .data(count)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error getting bookmark count: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<Long>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

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

