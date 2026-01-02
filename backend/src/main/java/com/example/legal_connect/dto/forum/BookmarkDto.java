package com.example.legal_connect.dto.forum;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookmarkDto {
    private Boolean isBookmarked;
    private Long bookmarkCount;
}

