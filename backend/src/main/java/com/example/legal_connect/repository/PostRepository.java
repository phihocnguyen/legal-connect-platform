package com.example.legal_connect.repository;

import com.example.legal_connect.entity.Post;
import com.example.legal_connect.entity.PostCategory;
import com.example.legal_connect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    /**
     * Find all active posts with pagination, ordered by creation time
     */
    Page<Post> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    
    /**
     * Find posts by category with pagination
     */
    Page<Post> findByCategoryAndIsActiveTrueOrderByCreatedAtDesc(PostCategory category, Pageable pageable);
    
    /**
     * Find posts by category slug
     */
    @Query("SELECT p FROM Post p JOIN p.category c WHERE c.slug = :categorySlug AND p.isActive = true ORDER BY p.createdAt DESC")
    Page<Post> findByCategorySlugAndIsActiveTrue(@Param("categorySlug") String categorySlug, Pageable pageable);
    
    /**
     * Find posts by author with pagination
     */
    Page<Post> findByAuthorAndIsActiveTrueOrderByCreatedAtDesc(User author, Pageable pageable);
    
    /**
     * Find pinned posts
     */
    List<Post> findByPinnedTrueAndIsActiveTrueOrderByCreatedAtDesc();
    
    /**
     * Find hot posts
     */
    List<Post> findByIsHotTrueAndIsActiveTrueOrderByCreatedAtDesc();
    
    /**
     * Find solved posts
     */
    Page<Post> findBySolvedTrueAndIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    
    /**
     * Search posts by title containing keyword
     */
    Page<Post> findByIsActiveTrueAndTitleContainingIgnoreCaseOrderByCreatedAtDesc(String title, Pageable pageable);
    
    /**
     * Search posts by content using native query (to avoid CLOB/STRING issues)
     */
    @Query(value = "SELECT p.* FROM posts p WHERE p.is_active = true AND p.content LIKE ?1", 
           nativeQuery = true,
           countQuery = "SELECT COUNT(*) FROM posts p WHERE p.is_active = true AND p.content LIKE ?1")
    Page<Post> findByIsActiveTrueAndContentContaining(String content, Pageable pageable);
    
    /**
     * Find posts by tags containing keyword using native query
     */
    @Query(value = "SELECT p.* FROM posts p WHERE p.is_active = true AND LOWER(p.tags) LIKE LOWER(?1)", 
           nativeQuery = true,
           countQuery = "SELECT COUNT(*) FROM posts p WHERE p.is_active = true AND LOWER(p.tags) LIKE LOWER(?1)")
    Page<Post> findByIsActiveTrueAndTagsContaining(String tags, Pageable pageable);
    
    /**
     * Find recent posts within time period
     */
    @Query("SELECT p FROM Post p WHERE p.isActive = true AND p.createdAt >= :since ORDER BY p.createdAt DESC")
    Page<Post> findRecentPosts(@Param("since") LocalDateTime since, Pageable pageable);
    
    /**
     * Find most viewed posts
     */
    Page<Post> findByIsActiveTrueOrderByViewsDesc(Pageable pageable);
    
    /**
     * Find most replied posts
     */
    Page<Post> findByIsActiveTrueOrderByReplyCountDesc(Pageable pageable);
    
    /**
     * Count posts by category
     */
    long countByCategoryAndIsActiveTrue(PostCategory category);
    
    /**
     * Count posts by author
     */
    long countByAuthorAndIsActiveTrue(User author);
    
    /**
     * Increment view count
     */
    @Modifying
    @Query("UPDATE Post p SET p.views = p.views + 1 WHERE p.id = :postId")
    void incrementViews(@Param("postId") Long postId);
    
    /**
     * Update reply count
     */
    @Modifying
    @Query("UPDATE Post p SET p.replyCount = (SELECT COUNT(r) FROM PostReply r WHERE r.post.id = p.id AND r.isActive = true) WHERE p.id = :postId")
    void updateReplyCount(@Param("postId") Long postId);
    
    /**
     * Update last reply time
     */
    @Modifying
    @Query("UPDATE Post p SET p.lastReplyAt = :lastReplyAt WHERE p.id = :postId")
    void updateLastReplyTime(@Param("postId") Long postId, @Param("lastReplyAt") LocalDateTime lastReplyAt);
    
    /**
     * Find posts with eager loading of category and author
     */
    @Query("SELECT p FROM Post p JOIN FETCH p.category JOIN FETCH p.author WHERE p.isActive = true ORDER BY p.createdAt DESC")
    Page<Post> findAllWithCategoryAndAuthor(Pageable pageable);
    
    /**
     * Find post by ID with category and author
     */
    @Query("SELECT p FROM Post p JOIN FETCH p.category JOIN FETCH p.author WHERE p.id = :id AND p.isActive = true")
    Optional<Post> findByIdWithCategoryAndAuthor(@Param("id") Long id);
}