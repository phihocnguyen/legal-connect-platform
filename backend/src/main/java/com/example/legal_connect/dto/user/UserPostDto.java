package com.example.legal_connect.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPostDto {
    private Long id;
    private String title;
    private String content;
    private String categoryName;
    private String categorySlug;
    private Integer views;
    private Integer replyCount;
    private Boolean pinned;
    private Boolean solved;
    private Boolean isHot;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
