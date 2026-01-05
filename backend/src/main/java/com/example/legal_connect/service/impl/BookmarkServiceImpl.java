package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.forum.BookmarkDto;
import com.example.legal_connect.dto.forum.PostDto;
import com.example.legal_connect.entity.Post;
import com.example.legal_connect.entity.PostBookmark;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.mapper.PostMapper;
import com.example.legal_connect.repository.ForumRepository;
import com.example.legal_connect.repository.PostBookmarkRepository;
import com.example.legal_connect.repository.UserRepository;
import com.example.legal_connect.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookmarkServiceImpl implements BookmarkService {
    
    private final PostBookmarkRepository bookmarkRepository;
    private final ForumRepository forumRepository;
    private final UserRepository userRepository;
    private final PostMapper postMapper;
    
    @Override
    @Transactional
    public BookmarkDto toggleBookmark(Long postId, Long userId) {
        try {
            log.info("toggleBookmark - postId: {}, userId: {}", postId, userId);
            
            Post post = forumRepository.findById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            log.info("Post found: {}", post.getId());
            
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            log.info("User found: {}", user.getId());
            
            Optional<PostBookmark> existingBookmark = bookmarkRepository.findByPostIdAndUserId(postId, userId);
            
            if (existingBookmark.isPresent()) {
                bookmarkRepository.delete(existingBookmark.get());
                log.info("Removed bookmark for post {} by user {}", postId, userId);
            } else {
                PostBookmark bookmark = PostBookmark.builder()
                        .post(post)
                        .user(user)
                        .build();
                bookmarkRepository.save(bookmark);
                log.info("Added bookmark for post {} by user {}", postId, userId);
            }
            
            BookmarkDto result = getBookmarkStatus(postId, userId);
            log.info("toggleBookmark result: isBookmarked={}, count={}", result.getIsBookmarked(), result.getBookmarkCount());
            return result;
        } catch (Exception e) {
            log.error("Error in toggleBookmark: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean isBookmarked(Long postId, Long userId) {
        return bookmarkRepository.existsByPostIdAndUserId(postId, userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public BookmarkDto getBookmarkStatus(Long postId, Long userId) {
        boolean isBookmarked = userId != null && bookmarkRepository.existsByPostIdAndUserId(postId, userId);
        long bookmarkCount = bookmarkRepository.countByPostId(postId);
        
        return BookmarkDto.builder()
                .isBookmarked(isBookmarked)
                .bookmarkCount(bookmarkCount)
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<PostDto> getUserBookmarks(Long userId, Pageable pageable) {
        Page<PostBookmark> bookmarks = bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return bookmarks.map(bookmark -> postMapper.toDto(bookmark.getPost()));
    }
    
    @Override
    @Transactional(readOnly = true)
    public long getBookmarkCount(Long postId) {
        return bookmarkRepository.countByPostId(postId);
    }
}

