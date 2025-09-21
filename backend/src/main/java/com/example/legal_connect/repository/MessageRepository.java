package com.example.legal_connect.repository;

import com.example.legal_connect.entity.Message;
import com.example.legal_connect.entity.Message.MessageRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    /**
     * Find all messages by conversation ID ordered by created date
     */
    List<Message> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    /**
     * Find messages by conversation ID and role
     */
    List<Message> findByConversationIdAndRoleOrderByCreatedAtAsc(Long conversationId, MessageRole role);

    /**
     * Count messages by conversation ID
     */
    long countByConversationId(Long conversationId);

    /**
     * Find latest message in a conversation
     */
    @Query("SELECT m FROM Message m WHERE m.conversationId = :conversationId ORDER BY m.createdAt DESC LIMIT 1")
    Message findLatestByConversationId(@Param("conversationId") Long conversationId);

    /**
     * Delete all messages by conversation ID
     */
    void deleteByConversationId(Long conversationId);
}