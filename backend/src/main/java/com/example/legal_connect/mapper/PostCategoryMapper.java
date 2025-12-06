package com.example.legal_connect.mapper;

import com.example.legal_connect.entity.PostCategory;
import com.example.legal_connect.dto.forum.PostCategoryDto;
import org.springframework.stereotype.Component;

@Component
public class PostCategoryMapper {

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

        // Don't load posts collection here to avoid N+1 queries
        // Statistics should be calculated separately if needed
        builder.threadsCount(0).postsCount(0);

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
}