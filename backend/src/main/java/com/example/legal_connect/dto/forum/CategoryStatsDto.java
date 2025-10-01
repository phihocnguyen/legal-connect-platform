package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * DTO for category statistics
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryStatsDto {

    private Long id;
    private String name;
    private String slug;
    private String icon;
    private Long topicCount;
    private Long totalPostCount;
    private Long topicsToday;
}
