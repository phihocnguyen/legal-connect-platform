package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;
import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostCategoryDto implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private Long id;
    
    private String slug;
    
    private String name;
    
    private String description;
    
    private String icon;
    
    private Integer displayOrder;
    
    private Boolean isActive;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Statistics
    private Integer threadsCount;
    
    private Integer postsCount;
    
    // Labels associated with this category
    private List<PostLabelDto> labels;
    
    // Last post information
    private PostSummaryDto lastPost;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PostSummaryDto implements Serializable {
        private static final long serialVersionUID = 2L;
        private Long id;
        private String title;
        private String slug;
        private String authorName;
        private String authorRole;
        private String authorAvatar;
        private Integer views;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;
    }
}