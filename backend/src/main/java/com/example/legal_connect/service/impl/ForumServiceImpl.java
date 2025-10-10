package com.example.legal_connect.service.impl;
import com.example.legal_connect.dto.forum.CategoryStatsDto;
import com.example.legal_connect.dto.forum.ForumStatsDto;
import com.example.legal_connect.dto.forum.PopularTagDto;
import com.example.legal_connect.dto.forum.PopularTopicDto;
import com.example.legal_connect.dto.forum.PostCategoryDto;
import com.example.legal_connect.dto.forum.PostCreateDto;
import com.example.legal_connect.dto.forum.PostDto;
import com.example.legal_connect.dto.forum.PostReplyDto;
import com.example.legal_connect.entity.*;
import com.example.legal_connect.repository.*;
import com.example.legal_connect.service.ForumService;
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
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ForumServiceImpl implements ForumService {
    private final ForumRepository postRepository;
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
    public Page<PostDto> getAllPosts(Pageable pageable, Long categoryId, String timeFilter) {
        if (categoryId != null) {
            // Filter by category
            return postRepository.findByCategoryIdAndIsActiveTrueOrderByCreatedAtDesc(categoryId, pageable)
                    .map(postMapper::toDto);
        }
        
        if (timeFilter != null && !timeFilter.equals("all")) {
            LocalDateTime startDate = null;
            LocalDateTime now = LocalDateTime.now();
            
            switch (timeFilter) {
                case "today":
                    startDate = now.toLocalDate().atStartOfDay();
                    break;
                case "week":
                    startDate = now.minusWeeks(1);
                    break;
                case "month":
                    startDate = now.minusMonths(1);
                    break;
                case "year":
                    startDate = now.minusYears(1);
                    break;
            }
            
            if (startDate != null) {
                return postRepository.findByIsActiveTrueAndCreatedAtAfterOrderByCreatedAtDesc(startDate, pageable)
                        .map(postMapper::toDto);
            }
        }
        
        // Default: return all posts
        return getAllPosts(pageable);
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
    
    // Statistics
    @Override
    public ForumStatsDto getForumStats() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        
        long totalPosts = postRepository.countByIsActiveTrue();
        long totalReplies = postReplyRepository.countByIsActiveTrue();
        long totalMembers = userRepository.count();
        
        long postsToday = postRepository.countByIsActiveTrueAndCreatedAtAfter(startOfToday);
        long repliesToday = postReplyRepository.countByIsActiveTrueAndCreatedAtAfter(startOfToday);
        long membersToday = userRepository.countByCreatedAtAfter(startOfToday);
        
        return ForumStatsDto.builder()
                .totalTopics(totalPosts)
                .totalPosts(totalPosts + totalReplies)
                .totalMembers(totalMembers)
                .topicsToday(postsToday)
                .postsToday(postsToday + repliesToday)
                .membersToday(membersToday)
                .build();
    }
    
    @Override
    public List<PopularTopicDto> getPopularTopics(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<Post> popularPosts = postRepository.findPopularTopics(pageable);
        
        return popularPosts.stream()
                .map(post -> {
                    String badge = null;
                    if (post.getIsHot()) {
                        badge = "hot";
                    } else if (post.getSolved()) {
                        badge = "solved";
                    } else if (post.getViews() > 100) {
                        badge = "trending";
                    }
                    
                    return PopularTopicDto.builder()
                            .id(post.getId())
                            .title(post.getTitle())
                            .categoryName(post.getCategory().getName())
                            .categorySlug(post.getCategory().getSlug())
                            .views(post.getViews())
                            .replyCount(post.getReplyCount())
                            .badge(badge)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public List<CategoryStatsDto> getCategoryStats() {
        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        List<PostCategory> categories = postCategoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        
        return categories.stream()
                .map(category -> {
                    long topicCount = postRepository.countByCategoryIdAndIsActiveTrue(category.getId());
                    long topicsToday = postRepository.countByCategoryIdAndIsActiveTrueAndCreatedAtAfter(
                            category.getId(), startOfToday);
                    
                    // Count total posts (topics + replies) for this category
                    long totalPostCount = topicCount; // This is simplified, you might want to add reply count
                    
                    return CategoryStatsDto.builder()
                            .id(category.getId())
                            .name(category.getName())
                            .slug(category.getSlug())
                            .icon(category.getIcon())
                            .topicCount(topicCount)
                            .totalPostCount(totalPostCount)
                            .topicsToday(topicsToday)
                            .build();
                })
                .collect(Collectors.toList());
    }
    
    @Override
    public List<PopularTagDto> getPopularTags(int limit) {
        List<Object[]> tagResults = postRepository.findPopularTags(limit);
        
        return tagResults.stream()
                .map(result -> PopularTagDto.builder()
                        .tag((String) result[0])
                        .count(((Number) result[1]).longValue())
                        .build())
                .collect(Collectors.toList());
    }
}
