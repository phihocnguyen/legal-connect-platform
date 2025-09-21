package com.example.legal_connect.service;

import com.example.legal_connect.dto.conversation.MessageDto;
import com.example.legal_connect.dto.conversation.SendMessageRequest;

import java.util.List;

public interface MessageService {
    
    /**
     * Send a user message and get AI response
     */
    MessageDto sendMessage(SendMessageRequest request, Long userId);
    
    /**
     * Get all messages for a conversation
     */
    List<MessageDto> getConversationMessages(Long conversationId, Long userId);
    
    /**
     * Save a message
     */
    MessageDto saveMessage(Long conversationId, String content, com.example.legal_connect.entity.Message.MessageRole role);
    
    /**
     * Delete all messages for a conversation
     */
    void deleteConversationMessages(Long conversationId);
}