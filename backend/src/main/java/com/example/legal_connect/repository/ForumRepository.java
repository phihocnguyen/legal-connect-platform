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
public interface ForumRepository extends JpaRepository<Post, Long> {
    
    /**
     * Find all active posts with pagination, ordered by creation time
     */
    Page<Post> findByIsActiveTrueOrderByCreatedAtDesc(Pageable pageable);
    
    /**
     * Find posts by isActive status
     */
    Page<Post> findByIsActive(Boolean isActive, Pageable pageable);
    
    /**
     * Find posts by title or content containing search term (for admin moderation)
     */
    Page<Post> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
        String title, String content, Pageable pageable);
    
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
    @Query(value = "SELECT p.id, p.title, p.content, p.category_id, p.author_id, p.views, p.reply_count, p.upvote_count, p.downvote_count, p.is_pinned, p.is_solved, p.is_hot, p.is_active, p.report_count, p.is_reported, p.violation_reason, p.tags, p.created_at, p.updated_at, p.last_reply_at FROM posts p WHERE p.is_active = true AND p.content LIKE ?1", 
           nativeQuery = true,
           countQuery = "SELECT COUNT(*) FROM posts p WHERE p.is_active = true AND p.content LIKE ?1")
    Page<Post> findByIsActiveTrueAndContentContaining(String content, Pageable pageable);
    
    /**
     * Find posts by tags containing keyword using native query
     */
    @Query(value = "SELECT p.id, p.title, p.content, p.category_id, p.author_id, p.views, p.reply_count, p.upvote_count, p.downvote_count, p.is_pinned, p.is_solved, p.is_hot, p.is_active, p.report_count, p.is_reported, p.violation_reason, p.tags, p.created_at, p.updated_at, p.last_reply_at FROM posts p WHERE p.is_active = true AND LOWER(p.tags) LIKE LOWER(?1)", 
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
     * Find posts by category ID
     */
    Page<Post> findByCategoryIdAndIsActiveTrueOrderByCreatedAtDesc(Long categoryId, Pageable pageable);
    
    /**
     * Find posts created after a certain date
     */
    Page<Post> findByIsActiveTrueAndCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime startDate, Pageable pageable);
    
    /**
     * Find post by ID with category and author
     */
    @Query("SELECT p FROM Post p JOIN FETCH p.category JOIN FETCH p.author WHERE p.id = :id AND p.isActive = true")
    Optional<Post> findByIdWithCategoryAndAuthor(@Param("id") Long id);
    
    // === STATISTICS QUERIES ===
    
    /**
     * Count total active posts
     */
    long countByIsActiveTrue();
    
    /**
     * Count posts created since a specific time
     */
    long countByIsActiveTrueAndCreatedAtAfter(LocalDateTime since);
    
    /**
     * Get popular topics (by views and replies)
     */
    @Query("SELECT p FROM Post p JOIN FETCH p.category WHERE p.isActive = true ORDER BY (p.views + p.replyCount * 2) DESC")
    List<Post> findPopularTopics(Pageable pageable);
    
    /**
     * Get all distinct tags from active posts
     */
    @Query(value = "SELECT tag_value as tag, COUNT(*) as count " +
           "FROM posts p " +
           "CROSS JOIN LATERAL unnest(string_to_array(LOWER(p.tags), ',')) AS tag_value " +
           "WHERE p.is_active = true AND p.tags IS NOT NULL AND p.tags != '' " +
           "GROUP BY tag_value " +
           "ORDER BY count DESC " +
           "LIMIT :limit",
           nativeQuery = true)
    List<Object[]> findPopularTags(@Param("limit") int limit);
    
    /**
     * Count posts by category ID
     */
    long countByCategoryIdAndIsActiveTrue(Long categoryId);
    
    /**
     * Count posts by category ID created since a specific time
     */
    long countByCategoryIdAndIsActiveTrueAndCreatedAtAfter(Long categoryId, LocalDateTime since);
    
    // Dashboard statistics methods
    long countByCreatedAtAfter(LocalDateTime since);
    List<Post> findTop5ByOrderByCreatedAtDesc();
    
    // Chart data methods
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Default implementations for missing fields
    default long countByIsReportedTrue() {
        return 0; // Return 0 for now since isReported field doesn't exist yet
    }
    
    default long countDistinctCategories() {
        return 5; // Hardcoded for now
    }
    
    default List<Post> findTopPostsByViews(LocalDateTime since, Pageable pageable) {
        return findTop5ByOrderByCreatedAtDesc(); // Use recent posts for now
    }
    
    default List<Post> findTopPostsByViews(LocalDateTime since, int limit) {
        return findTopPostsByViews(since, Pageable.ofSize(limit));
    }

    // ========== VIOLATION POSTS QUERIES ==========
    
    /**
     * Find posts with report count greater than threshold
     */
    Page<Post> findByReportCountGreaterThan(int reportCount, Pageable pageable);
    
    /**
     * Find posts with report count greater than threshold and specific status
     */
    Page<Post> findByReportCountGreaterThanAndIsActive(int reportCount, Boolean isActive, Pageable pageable);
    
    /**
     * Find reported posts by title or content containing search term
     */
    @Query("SELECT p FROM Post p WHERE p.reportCount > :reportCount AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Post> findReportedPostsBySearchTerm(
        @Param("reportCount") int reportCount, 
        @Param("searchTerm") String searchTerm, 
        Pageable pageable);
    
    /**
     * Find reported posts by title or content containing search term and specific status
     */
    @Query("SELECT p FROM Post p WHERE p.reportCount > :reportCount AND p.isActive = :isActive AND " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(p.content) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Post> findReportedPostsBySearchTermAndStatus(
        @Param("reportCount") int reportCount, 
        @Param("isActive") Boolean isActive,
        @Param("searchTerm") String searchTerm, 
        Pageable pageable);
}