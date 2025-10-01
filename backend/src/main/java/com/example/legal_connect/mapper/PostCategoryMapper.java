package com.example.legal_connect.mapper;

import com.example.legal_connect.entity.PostCategory;
import com.example.legal_connect.dto.forum.PostCategoryDto;
import com.example.legal_connect.entity.Post;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class PostCategoryMapper {

    private final UserMapper userMapper;

    /**
     * Convert PostCategory entity to PostCategoryDto
     */
    public PostCategoryDto toDto(PostCategory category) {
        if (category == null) {
            return null;
        }

        PostCategoryDto.PostCategoryDtoBuilder builder = PostCategoryDto.builder()
                .id(category.getId())
                .slug(category.getSlug())
                .name(category.getName())
                .description(category.getDescription())
                .icon(category.getIcon())
                .displayOrder(category.getDisplayOrder())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt());

        // Calculate statistics if posts are loaded
        if (category.getPosts() != null) {
            builder.threadsCount(category.getThreadsCount())
                   .postsCount(category.getTotalPostsCount());
            
            // Find latest post for lastPost information
            Post latestPost = category.getPosts().stream()
                .filter(Post::getIsActive)
                .max((p1, p2) -> p1.getCreatedAt().compareTo(p2.getCreatedAt()))
                .orElse(null);
            
            if (latestPost != null) {
                PostCategoryDto.PostSummaryDto lastPost = PostCategoryDto.PostSummaryDto.builder()
                    .id(latestPost.getId())
                    .title(latestPost.getTitle())
                    .authorName(getAuthorName(latestPost))
                    .authorRole(getAuthorRole(latestPost))
                    .createdAt(latestPost.getCreatedAt())
                    .build();
                builder.lastPost(lastPost);
            }
        } else {
            // If posts are not loaded, set default values
            builder.threadsCount(0).postsCount(0);
        }

        return builder.build();
    }

    /**
     * Convert PostCategoryDto to PostCategory entity (for create/update operations)
     */
    public PostCategory toEntity(PostCategoryDto dto) {
        if (dto == null) {
            return null;
        }

        PostCategory category = new PostCategory();
        category.setId(dto.getId());
        category.setSlug(dto.getSlug());
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setIcon(dto.getIcon());
        category.setDisplayOrder(dto.getDisplayOrder());
        category.setIsActive(dto.getIsActive());
        category.setCreatedAt(dto.getCreatedAt());
        category.setUpdatedAt(dto.getUpdatedAt());

        return category;
    }

    /**
     * Helper method to get author name from post
     */
    private String getAuthorName(Post post) {
        return userMapper.getDisplayName(post.getAuthor());
    }

    /**
     * Helper method to get author role from post
     */
    private String getAuthorRole(Post post) {
        return userMapper.getRoleString(post.getAuthor());
    }
}