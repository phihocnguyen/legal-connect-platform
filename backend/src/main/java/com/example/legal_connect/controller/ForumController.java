package com.example.legal_connect.controller;
import com.example.legal_connect.dto.forum.AddReplyDto;
import com.example.legal_connect.dto.forum.CategoryStatsDto;
import com.example.legal_connect.dto.forum.ForumStatsDto;
import com.example.legal_connect.dto.forum.PopularTagDto;
import com.example.legal_connect.dto.forum.PopularTopicDto;
import com.example.legal_connect.dto.forum.PostCategoryDto;
import com.example.legal_connect.dto.forum.PostCreateDto;
import com.example.legal_connect.dto.forum.PostDto;
import com.example.legal_connect.dto.forum.PostReplyDto;
import com.example.legal_connect.service.ForumService;
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
public class ForumController {

    private final ForumService postService;
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
            Pageable pageable,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String timeFilter) {
        System.out.println("getAllPosts - Pageable: " + pageable);
        System.out.println("getAllPosts - CategoryId: " + categoryId);
        System.out.println("getAllPosts - TimeFilter: " + timeFilter);
        Page<PostDto> posts = postService.getAllPosts(pageable, categoryId, timeFilter);
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

    @PutMapping("/posts/{id}")
    public ResponseEntity<PostDto> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostCreateDto postUpdateDto,
            Authentication authentication) {
        Long authorId = getUserIdFromAuthentication(authentication);
        PostDto updatedPost = postService.updatePost(id, postUpdateDto, authorId);
        return ResponseEntity.ok(updatedPost);
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Void> deletePost(
            @PathVariable Long id,
            Authentication authentication) {
        Long authorId = getUserIdFromAuthentication(authentication);
        postService.deletePost(id, authorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/posts/{postId}/replies")
    public ResponseEntity<List<PostReplyDto>> getRepliesByPost(@PathVariable Long postId) {
        List<PostReplyDto> replies = postService.getRepliesByPost(postId);
        return ResponseEntity.ok(replies);
    }

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

    private Long getUserIdFromAuthentication(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            
            if (principal instanceof com.example.legal_connect.security.UserPrincipal) {
                com.example.legal_connect.security.UserPrincipal userPrincipal = 
                    (com.example.legal_connect.security.UserPrincipal) principal;
                return userPrincipal.getId();
            }
        }
        throw new RuntimeException("User not authenticated");
    }
    
    @GetMapping("/stats")
    public ResponseEntity<ForumStatsDto> getForumStats() {
        ForumStatsDto stats = postService.getForumStats();
        return ResponseEntity.ok(stats);
    }
    
    @GetMapping("/popular-topics")
    public ResponseEntity<List<PopularTopicDto>> getPopularTopics(
            @RequestParam(defaultValue = "5") int limit) {
        List<PopularTopicDto> topics = postService.getPopularTopics(limit);
        return ResponseEntity.ok(topics);
    }
    

    @GetMapping("/category-stats")
    public ResponseEntity<List<CategoryStatsDto>> getCategoryStats() {
        List<CategoryStatsDto> stats = postService.getCategoryStats();
        return ResponseEntity.ok(stats);
    }
    

    @GetMapping("/popular-tags")
    public ResponseEntity<List<PopularTagDto>> getPopularTags(
            @RequestParam(defaultValue = "10") int limit) {
        List<PopularTagDto> tags = postService.getPopularTags(limit);
        return ResponseEntity.ok(tags);
    }
}