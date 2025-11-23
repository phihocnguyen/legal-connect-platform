package com.example.legal_connect.repository;

import com.example.legal_connect.entity.Mention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentionRepository extends JpaRepository<Mention, Long> {
    
    List<Mention> findByMentionedUserIdOrderByCreatedAtDesc(Long mentionedUserId);
    
    @Query("SELECT m FROM Mention m WHERE m.post.id = :postId")
    List<Mention> findByPostId(@Param("postId") Long postId);
    
    @Query("SELECT m FROM Mention m WHERE m.reply.id = :replyId")
    List<Mention> findByReplyId(@Param("replyId") Long replyId);
}

