package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * DTO for forum statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForumStatsDto {
    private Long totalTopics;
    private Long totalPosts;
    private Long totalMembers;
    private Long topicsToday;
    private Long postsToday;
    private Long membersToday;
}
