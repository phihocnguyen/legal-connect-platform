package com.example.legal_connect.service;

import com.example.legal_connect.dto.conversation.*;
import com.example.legal_connect.entity.Conversation.ConversationType;

import java.util.List;

public interface ConversationService {
    
    /**
     * Create a new conversation
     */
    ConversationDto createConversation(CreateConversationRequest request, Long userId);
    
    /**
     * Get all conversations for a user
     */
    List<ConversationDto> getUserConversations(Long userId);
    
    /**
     * Get conversations by type for a user
     */
    List<ConversationDto> getUserConversationsByType(Long userId, ConversationType type);
    
    /**
     * Get conversation by ID (with security check)
     */
    ConversationDto getConversationById(Long conversationId, Long userId);
    
    /**
     * Get conversation with all messages and PDF document
     */
    ConversationDto getConversationWithDetails(Long conversationId, Long userId);
    
    /**
     * Update conversation title
     */
    ConversationDto updateConversationTitle(Long conversationId, Long userId, String title);
    
    /**
     * Delete conversation
     */
    void deleteConversation(Long conversationId, Long userId);
}