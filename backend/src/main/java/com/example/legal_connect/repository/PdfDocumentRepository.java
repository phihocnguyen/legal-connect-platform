package com.example.legal_connect.repository;

import com.example.legal_connect.entity.PdfDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PdfDocumentRepository extends JpaRepository<PdfDocument, Long> {

    /**
     * Find PDF document by conversation ID
     */
    Optional<PdfDocument> findByConversationId(Long conversationId);

    /**
     * Check if PDF document exists for conversation
     */
    boolean existsByConversationId(Long conversationId);

    /**
     * Delete PDF document by conversation ID
     */
    void deleteByConversationId(Long conversationId);

    /**
     * Find PDF document with conversation details
     */
    @Query("SELECT p FROM PdfDocument p LEFT JOIN FETCH p.conversation WHERE p.conversationId = :conversationId")
    Optional<PdfDocument> findByConversationIdWithConversation(@Param("conversationId") Long conversationId);
}