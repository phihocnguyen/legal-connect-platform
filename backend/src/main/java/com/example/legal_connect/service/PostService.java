package com.example.legal_connect.service;

import com.example.legal_connect.dto.PostCategoryDto;
import com.example.legal_connect.dto.PostCreateDto;
import com.example.legal_connect.dto.PostDto;
import com.example.legal_connect.dto.PostReplyDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PostService {
    // Category
    List<PostCategoryDto> getAllCategories();
    PostCategoryDto getCategoryBySlug(String slug);

    // Post
    Page<PostDto> getAllPosts(Pageable pageable);
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
}