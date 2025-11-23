package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostReplyDto {
    
    private Long id;
    
    private String content;
    
    private Long postId;
    
    private UserSummaryDto author;
    
    private Long parentId;
    
    private List<PostReplyDto> children;
    
    private Integer upvoteCount;
    
    private Integer downvoteCount;
    
    private String userVote; // Current user's vote: UPVOTE, DOWNVOTE, or null
    
    private List<Long> mentionedUserIds; // List of mentioned user IDs
    
    private Boolean isActive;
    
    private Boolean isSolution;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    // Helper fields
    private Boolean isTopLevel;
    
    private Integer childrenCount;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummaryDto {
        private Long id;
        private String name;
        private String email;
        private String role;
        private String avatar;
    }
}