package com.example.legal_connect.service;

import com.example.legal_connect.dto.forum.BookmarkDto;
import org.springframework.data.domain.Page;
import com.example.legal_connect.dto.forum.PostDto;

public interface BookmarkService {
    /**
     * Toggle bookmark for a post (add if not bookmarked, remove if bookmarked)
     */
    BookmarkDto toggleBookmark(Long postId, Long userId);
    
    /**
     * Check if a post is bookmarked by a user
     */
    boolean isBookmarked(Long postId, Long userId);
    
    /**
     * Get bookmark status for a post
     */
    BookmarkDto getBookmarkStatus(Long postId, Long userId);
    
    /**
     * Get all bookmarked posts for a user
     */
    Page<PostDto> getUserBookmarks(Long userId, org.springframework.data.domain.Pageable pageable);
    
    /**
     * Get bookmark count for a post
     */
    long getBookmarkCount(Long postId);
}

