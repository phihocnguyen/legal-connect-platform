package com.example.legal_connect.controller;

import com.example.legal_connect.dto.*;
import com.example.legal_connect.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/forum")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://localhost:3000"})
public class PostController {

    private final PostService postService;
    @GetMapping("/categories")
    public ResponseEntity<List<PostCategoryDto>> getAllCategories() {
        List<PostCategoryDto> categories = postService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/categories/{slug}")
    public ResponseEntity<PostCategoryDto> getCategoryBySlug(@PathVariable String slug) {
        PostCategoryDto category = postService.getCategoryBySlug(slug);
        return ResponseEntity.ok(category);
    }

    @GetMapping("/posts")
    public ResponseEntity<Page<PostDto>> getAllPosts(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<PostDto> posts = postService.getAllPosts(pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * Get posts by category
     */
    @GetMapping("/categories/{categorySlug}/posts")
    public ResponseEntity<Page<PostDto>> getPostsByCategory(
            @PathVariable String categorySlug,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<PostDto> posts = postService.getPostsByCategory(categorySlug, pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * Search posts by keyword
     */
    @GetMapping("/posts/search")
    public ResponseEntity<Page<PostDto>> searchPosts(
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<PostDto> posts = postService.searchPosts(keyword, pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * Search posts by keyword and category
     */
    @GetMapping("/categories/{categorySlug}/posts/search")
    public ResponseEntity<Page<PostDto>> searchPostsByCategory(
            @PathVariable String categorySlug,
            @RequestParam String keyword,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<PostDto> posts = postService.searchPostsByCategory(keyword, categorySlug, pageable);
        return ResponseEntity.ok(posts);
    }

    /**
     * Get post by ID
     */
    @GetMapping("/posts/{id}")
    public ResponseEntity<PostDto> getPostById(@PathVariable Long id) {
        PostDto post = postService.getPostById(id);
        return ResponseEntity.ok(post);
    }

    /**
     * Create new post
     */
    @PostMapping("/posts")
    public ResponseEntity<PostDto> createPost(
            @Valid @RequestBody PostCreateDto postCreateDto,
            Authentication authentication) {
        Long authorId = getUserIdFromAuthentication(authentication);
        PostDto createdPost = postService.createPost(postCreateDto, authorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
    }

    /**
     * Update post
     */
    @PutMapping("/posts/{id}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostCreateDto postUpdateDto,
            Authentication authentication) {
        Long authorId = getUserIdFromAuthentication(authentication);
        PostDto updatedPost = postService.updatePost(id, postUpdateDto, authorId);
        return ResponseEntity.ok(updatedPost);
    }

    /**
     * Delete post (soft delete)
     */
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            Authentication authentication) {
        Long authorId = getUserIdFromAuthentication(authentication);
        postService.deletePost(id, authorId);
        return ResponseEntity.noContent().build();
    }

    // === REPLY ENDPOINTS ===

    /**
     * Get replies for a post
     */
    @GetMapping("/posts/{postId}/replies")
    public ResponseEntity<List<PostReplyDto>> getRepliesByPost(@PathVariable Long postId) {
        List<PostReplyDto> replies = postService.getRepliesByPost(postId);
        return ResponseEntity.ok(replies);
    }

    /**
     * Add reply to a post
     */
    @PostMapping("/posts/{postId}/replies")
    public ResponseEntity<PostReplyDto> addReply(
            @PathVariable Long postId,
            @Valid @RequestBody AddReplyDto addReplyDto,
            Authentication authentication) {
        Long authorId = getUserIdFromAuthentication(authentication);
        PostReplyDto reply = postService.addReply(
                postId, 
                addReplyDto.getContent(), 
                authorId, 
                addReplyDto.getParentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(reply);
    }

    /**
     * Delete reply
     */
    @DeleteMapping("/replies/{replyId}")
    public ResponseEntity<Void> deleteReply(
            @PathVariable Long replyId,
            Authentication authentication) {
        Long authorId = getUserIdFromAuthentication(authentication);
        postService.deleteReply(replyId, authorId);
        return ResponseEntity.noContent().build();
    }

    // === UTILITY METHODS ===

    /**
     * Extract user ID from authentication
     */
    private Long getUserIdFromAuthentication(Authentication authentication) {
        // This method should be implemented based on your authentication setup
        // For now, returning a placeholder
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.User) {
            // Implement based on your UserDetails implementation
            return 1L; // Placeholder
        }
        throw new RuntimeException("User not authenticated");
    }
}