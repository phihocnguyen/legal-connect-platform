package com.example.legal_connect.repository;

import com.example.legal_connect.entity.ReplyVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReplyVoteRepository extends JpaRepository<ReplyVote, Long> {
    
    Optional<ReplyVote> findByReplyIdAndUserId(Long replyId, Long userId);
    
    @Query("SELECT COUNT(v) FROM ReplyVote v WHERE v.reply.id = :replyId AND v.voteType = :voteType")
    long countByReplyIdAndVoteType(@Param("replyId") Long replyId, @Param("voteType") ReplyVote.VoteType voteType);
    
    void deleteByReplyIdAndUserId(Long replyId, Long userId);
}

