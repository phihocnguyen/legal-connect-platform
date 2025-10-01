package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostCategoryDto {
    
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
    
    // Last post information
    private PostSummaryDto lastPost;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PostSummaryDto {
        private Long id;
        private String title;
        private String authorName;
        private String authorRole;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime createdAt;
    }
}