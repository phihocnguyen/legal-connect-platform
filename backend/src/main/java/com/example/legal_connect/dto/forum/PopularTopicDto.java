package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * DTO for popular topics (simplified version for sidebar)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopularTopicDto {
    
    private Long id;
    private String title;
    private String categoryName;
    private String categorySlug;
    private Integer views;
    private Integer replyCount;
    private String badge;
}
