package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.*;
import com.example.legal_connect.entity.*;
import com.example.legal_connect.repository.*;
import com.example.legal_connect.service.PostService;
import com.example.legal_connect.mapper.PostMapper;
import com.example.legal_connect.mapper.PostCategoryMapper;
import com.example.legal_connect.mapper.PostReplyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostServiceImpl implements PostService {
    private final PostRepository postRepository;
    private final PostCategoryRepository postCategoryRepository;
    private final PostReplyRepository postReplyRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;
    private final PostCategoryMapper categoryMapper;
    private final PostReplyMapper replyMapper;

    // Category
    @Override
    public List<PostCategoryDto> getAllCategories() {
        return postCategoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(categoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PostCategoryDto getCategoryBySlug(String slug) {
        PostCategory category = postCategoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return categoryMapper.toDto(category);
    }

    // Post
    @Override
    public Page<PostDto> getAllPosts(Pageable pageable) {
        return postRepository.findByIsActiveTrueOrderByCreatedAtDesc(pageable)
                .map(postMapper::toDto);
    }

    @Override
    public Page<PostDto> getPostsByCategory(String categorySlug, Pageable pageable) {
        return postRepository.findByCategorySlugAndIsActiveTrue(categorySlug, pageable)
                .map(postMapper::toDto);
    }

        @Override
    public Page<PostDto> searchPosts(String keyword, Pageable pageable) {
        Page<Post> titleResults = postRepository.findByIsActiveTrueAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(keyword, pageable);
        if (titleResults.hasContent()) {
            return titleResults.map(postMapper::toDto);
        }
        Sort sort = Sort.by(Sort.Direction.DESC, "created_at");
        Pageable contentPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), sort);
        Page<Post> contentResults = postRepository.findByIsActiveTrueAndContentContaining("%" + keyword + "%", contentPageable);
        return contentResults.map(postMapper::toDto);
    }

    @Override
    public Page<PostDto> searchPostsByCategory(String keyword, String categorySlug, Pageable pageable) {
        return postRepository.findByCategorySlugAndIsActiveTrue(categorySlug, pageable)
                .map(postMapper::toDto);
    }

    @Override
    public PostDto getPostById(Long id) {
        Post post = postRepository.findByIdWithCategoryAndAuthor(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.incrementViews();
        postRepository.save(post);
        
        return postMapper.toDto(post);
    }

    @Override
    public PostDto createPost(PostCreateDto postCreateDto, Long authorId) {
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        PostCategory category = postCategoryRepository.findById(postCreateDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        Post post = postMapper.toEntity(postCreateDto, category, author);
        post = postRepository.save(post);
        return postMapper.toDto(post);
    }

    @Override
    public PostDto updatePost(Long id, PostCreateDto postUpdateDto, Long authorId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        PostCategory category = null;
        if (postUpdateDto.getCategoryId() != null) {
            category = postCategoryRepository.findById(postUpdateDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
        }
        
        postMapper.updateEntity(post, postUpdateDto, category);
        post = postRepository.save(post);
        return postMapper.toDto(post);
    }

    @Override
    public void deletePost(Long id, Long authorId) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        if (!post.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        post.setIsActive(false);
        postRepository.save(post);
    }

    // Reply
    @Override
    public List<PostReplyDto> getRepliesByPost(Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        return postReplyRepository.findByPostAndParentIsNullAndIsActiveTrueOrderByCreatedAtAsc(post)
                .stream()
                .map(replyMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public PostReplyDto addReply(Long postId, String content, Long authorId, Long parentId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User author = userRepository.findById(authorId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        PostReply reply = new PostReply();
        reply.setPost(post);
        reply.setAuthor(author);
        reply.setContent(content);
        
        if (parentId != null) {
            PostReply parent = postReplyRepository.findById(parentId)
                    .orElseThrow(() -> new RuntimeException("Parent reply not found"));
            reply.setParent(parent);
        }
        
        reply = postReplyRepository.save(reply);
        
        // Update post statistics
        postRepository.updateReplyCount(postId);
        postRepository.updateLastReplyTime(postId, reply.getCreatedAt());
        
        return replyMapper.toDto(reply);
    }

    @Override
    public void deleteReply(Long replyId, Long authorId) {
        PostReply reply = postReplyRepository.findById(replyId)
                .orElseThrow(() -> new RuntimeException("Reply not found"));
        
        if (!reply.getAuthor().getId().equals(authorId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        reply.setIsActive(false);
        postReplyRepository.save(reply);
        
        // Update post reply count
        postRepository.updateReplyCount(reply.getPost().getId());
    }
}
