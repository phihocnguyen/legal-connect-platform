package com.example.legal_connect.repository;

import com.example.legal_connect.entity.Post;
import com.example.legal_connect.entity.PostReply;
import com.example.legal_connect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostReplyRepository extends JpaRepository<PostReply, Long> {
    
    /**
     * Find all replies for a post (top-level only)
     */
    List<PostReply> findByPostAndParentIsNullAndIsActiveTrueOrderByCreatedAtAsc(Post post);
    
    /**
     * Find all replies for a post with pagination (top-level only)
     */
    Page<PostReply> findByPostAndParentIsNullAndIsActiveTrueOrderByCreatedAtAsc(Post post, Pageable pageable);
    
    /**
     * Find all replies for a post including nested ones
     */
    @Query("SELECT r FROM PostReply r WHERE r.post = :post AND r.isActive = true ORDER BY r.createdAt ASC")
    List<PostReply> findAllByPostAndIsActiveTrue(@Param("post") Post post);
    
    /**
     * Find children of a reply
     */
    List<PostReply> findByParentAndIsActiveTrueOrderByCreatedAtAsc(PostReply parent);
    
    /**
     * Find replies by author
     */
    Page<PostReply> findByAuthorAndIsActiveTrueOrderByCreatedAtDesc(User author, Pageable pageable);
    
    /**
     * Find solution reply for a post
     */
    @Query("SELECT r FROM PostReply r WHERE r.post = :post AND r.isSolution = true AND r.isActive = true")
    PostReply findSolutionByPost(@Param("post") Post post);
    
    /**
     * Count replies for a post
     */
    long countByPostAndIsActiveTrue(Post post);
    
    /**
     * Count top-level replies for a post
     */
    long countByPostAndParentIsNullAndIsActiveTrue(Post post);
    
    /**
     * Count replies by author
     */
    long countByAuthorAndIsActiveTrue(User author);
    
    /**
     * Find latest reply for a post
     */
    @Query("SELECT r FROM PostReply r WHERE r.post = :post AND r.isActive = true ORDER BY r.createdAt DESC")
    List<PostReply> findLatestReplyByPost(@Param("post") Post post, Pageable pageable);
    
    /**
     * Find replies with author information
     */
    @Query("SELECT r FROM PostReply r JOIN FETCH r.author WHERE r.post = :post AND r.parent IS NULL AND r.isActive = true ORDER BY r.createdAt ASC")
    List<PostReply> findTopLevelRepliesWithAuthor(@Param("post") Post post);
    
    /**
     * Find recent replies by user
     */
    @Query("SELECT r FROM PostReply r WHERE r.author = :author AND r.isActive = true ORDER BY r.createdAt DESC")
    List<PostReply> findRecentByAuthor(@Param("author") User author, Pageable pageable);
}