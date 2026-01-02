package com.example.legal_connect.repository;

import com.example.legal_connect.entity.PostBookmark;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostBookmarkRepository extends JpaRepository<PostBookmark, Long> {
    
    Optional<PostBookmark> findByPostIdAndUserId(Long postId, Long userId);
    
    boolean existsByPostIdAndUserId(Long postId, Long userId);
    
    void deleteByPostIdAndUserId(Long postId, Long userId);
    
    @Query("SELECT COUNT(b) FROM PostBookmark b WHERE b.post.id = :postId")
    long countByPostId(@Param("postId") Long postId);
    
    @Query("SELECT b FROM PostBookmark b WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    Page<PostBookmark> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
    @Query("SELECT COUNT(b) FROM PostBookmark b WHERE b.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
}

