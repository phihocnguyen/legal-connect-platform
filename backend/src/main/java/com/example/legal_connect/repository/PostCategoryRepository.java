package com.example.legal_connect.repository;

import com.example.legal_connect.entity.PostCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PostCategoryRepository extends JpaRepository<PostCategory, Long> {
    
    /**
     * Find category by slug
     */
    Optional<PostCategory> findBySlug(String slug);
    
    /**
     * Find all active categories ordered by display order
     */
    List<PostCategory> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    /**
     * Find all categories with post statistics
     */
    @Query("SELECT pc FROM PostCategory pc LEFT JOIN FETCH pc.posts WHERE pc.isActive = true ORDER BY pc.displayOrder ASC")
    List<PostCategory> findAllActiveWithPosts();
    
    /**
     * Check if slug exists (for unique validation)
     */
    boolean existsBySlug(String slug);
    
    /**
     * Check if slug exists for different category (for update validation)
     */
    boolean existsBySlugAndIdNot(String slug, Long id);
    
    /**
     * Find category by name (case insensitive)
     */
    Optional<PostCategory> findByNameIgnoreCase(String name);
    
    /**
     * Count total active categories
     */
    long countByIsActiveTrue();
}