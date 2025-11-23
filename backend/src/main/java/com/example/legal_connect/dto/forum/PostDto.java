package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDto {
    
    private Long id;
    
    private String title;
    
    private String content;
    
    private PostCategoryDto category;
    
    private UserSummaryDto author;
    
    private Integer views;
    
    private Integer replyCount;
    
    private Integer upvoteCount;
    
    private Integer downvoteCount;
    
    private String userVote; // Current user's vote: UPVOTE, DOWNVOTE, or null
    
    private Boolean pinned;
    
    private Boolean solved;
    
    private Boolean isHot;
    
    private Set<String> tags;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastReplyAt;
    
    // Last reply information
    private LastReplyDto lastReply;
    
    // Include replies for detailed view
    private List<PostReplyDto> replies;
    
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
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LastReplyDto {
        private String authorName;
        private String authorRole;
        @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
        private LocalDateTime date;
    }
}