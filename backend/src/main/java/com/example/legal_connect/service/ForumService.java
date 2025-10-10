package com.example.legal_connect.service;
import com.example.legal_connect.dto.forum.CategoryStatsDto;
import com.example.legal_connect.dto.forum.ForumStatsDto;
import com.example.legal_connect.dto.forum.PopularTagDto;
import com.example.legal_connect.dto.forum.PopularTopicDto;
import com.example.legal_connect.dto.forum.PostCategoryDto;
import com.example.legal_connect.dto.forum.PostCreateDto;
import com.example.legal_connect.dto.forum.PostDto;
import com.example.legal_connect.dto.forum.PostReplyDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ForumService {
    // Category
    List<PostCategoryDto> getAllCategories();
    PostCategoryDto getCategoryBySlug(String slug);

    // Post
    Page<PostDto> getAllPosts(Pageable pageable);
    Page<PostDto> getAllPosts(Pageable pageable, Long categoryId, String timeFilter);
    Page<PostDto> getPostsByCategory(String categorySlug, Pageable pageable);
    Page<PostDto> searchPosts(String keyword, Pageable pageable);
    Page<PostDto> searchPostsByCategory(String keyword, String categorySlug, Pageable pageable);
    PostDto getPostById(Long id);
    PostDto createPost(PostCreateDto postCreateDto, Long authorId);
    PostDto updatePost(Long id, PostCreateDto postUpdateDto, Long authorId);
    void deletePost(Long id, Long authorId);

    // Reply
    List<PostReplyDto> getRepliesByPost(Long postId);
    PostReplyDto addReply(Long postId, String content, Long authorId, Long parentId);
    void deleteReply(Long replyId, Long authorId);
    
    // Statistics
    ForumStatsDto getForumStats();
    List<PopularTopicDto> getPopularTopics(int limit);
    List<CategoryStatsDto> getCategoryStats();
    List<PopularTagDto> getPopularTags(int limit);
}