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
    

    List<PostReply> findByPostAndParentIsNullAndIsActiveTrueOrderByCreatedAtAsc(Post post);

    Page<PostReply> findByPostAndParentIsNullAndIsActiveTrueOrderByCreatedAtAsc(Post post, Pageable pageable);

    @Query("SELECT r FROM PostReply r WHERE r.post = :post AND r.isActive = true ORDER BY r.createdAt ASC")

    List<PostReply> findAllByPostAndIsActiveTrue(@Param("post") Post post);

    List<PostReply> findByParentAndIsActiveTrueOrderByCreatedAtAsc(PostReply parent);

    Page<PostReply> findByAuthorAndIsActiveTrueOrderByCreatedAtDesc(User author, Pageable pageable);

    @Query("SELECT r FROM PostReply r WHERE r.post = :post AND r.isSolution = true AND r.isActive = true")

    PostReply findSolutionByPost(@Param("post") Post post);

    long countByPostAndIsActiveTrue(Post post);

    long countByPostAndParentIsNullAndIsActiveTrue(Post post);

    long countByAuthorAndIsActiveTrue(User author);

    @Query("SELECT r FROM PostReply r WHERE r.post = :post AND r.isActive = true ORDER BY r.createdAt DESC")

    List<PostReply> findLatestReplyByPost(@Param("post") Post post, Pageable pageable);

    @Query("SELECT r FROM PostReply r JOIN FETCH r.author WHERE r.post = :post AND r.parent IS NULL AND r.isActive = true ORDER BY r.createdAt ASC")
    
    List<PostReply> findTopLevelRepliesWithAuthor(@Param("post") Post post);

    @Query("SELECT r FROM PostReply r WHERE r.author = :author AND r.isActive = true ORDER BY r.createdAt DESC")
    
    List<PostReply> findRecentByAuthor(@Param("author") User author, Pageable pageable);

    long countByIsActiveTrue();

    long countByIsActiveTrueAndCreatedAtAfter(java.time.LocalDateTime since);
}