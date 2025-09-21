package com.example.legal_connect.repository;

import com.example.legal_connect.entity.Conversation;
import com.example.legal_connect.entity.Conversation.ConversationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Find all conversations by user ID ordered by updated date descending
     */
    List<Conversation> findByUserIdOrderByUpdatedAtDesc(Long userId);

    /**
     * Find conversations by user ID and type
     */
    List<Conversation> findByUserIdAndTypeOrderByUpdatedAtDesc(Long userId, ConversationType type);

    /**
     * Find conversation by ID and user ID (for security)
     */
    Optional<Conversation> findByIdAndUserId(Long id, Long userId);

    /**
     * Count conversations by user ID
     */
    long countByUserId(Long userId);

    /**
     * Find conversations with messages eagerly loaded
     */
    @Query("SELECT c FROM Conversation c LEFT JOIN FETCH c.messages WHERE c.userId = :userId ORDER BY c.updatedAt DESC")
    List<Conversation> findByUserIdWithMessages(@Param("userId") Long userId);

    /**
     * Find conversation with messages and PDF document eagerly loaded
     */
    @Query("SELECT c FROM Conversation c LEFT JOIN FETCH c.messages LEFT JOIN FETCH c.pdfDocument WHERE c.id = :id AND c.userId = :userId")
    Optional<Conversation> findByIdAndUserIdWithDetails(@Param("id") Long id, @Param("userId") Long userId);
}