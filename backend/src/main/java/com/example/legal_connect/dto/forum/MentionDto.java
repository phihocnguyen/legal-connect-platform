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
public class MentionDto {
    
    private Long id;
    
    private UserSummaryDto mentionedUser;
    
    private String contentSnippet;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserSummaryDto {
        private Long id;
        private String name;
        private String email;
        private String avatar;
    }
}

