package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.conversation.MessageDto;
import com.example.legal_connect.dto.conversation.SendMessageRequest;
import com.example.legal_connect.entity.Conversation;
import com.example.legal_connect.entity.Message;
import com.example.legal_connect.entity.Message.MessageRole;
import com.example.legal_connect.mapper.ConversationMapper;
import com.example.legal_connect.repository.ConversationRepository;
import com.example.legal_connect.repository.MessageRepository;
import com.example.legal_connect.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMapper conversationMapper;

    @Override
    public MessageDto sendMessage(SendMessageRequest request, Long userId) {
        log.info("Sending message for conversation: {} by user: {}, role: {}", 
                request.getConversationId(), userId, request.getRole());
        
        // Verify user has access to the conversation
        Conversation conversation = conversationRepository.findByIdAndUserId(request.getConversationId(), userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        // Save message with the role from request (USER or ASSISTANT)
        MessageDto message = saveMessage(request.getConversationId(), request.getContent(), request.getRole());
        
        // Update conversation updated_at timestamp
        conversation.setUpdatedAt(java.time.LocalDateTime.now());
        conversationRepository.save(conversation);
        
        return message;
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDto> getConversationMessages(Long conversationId, Long userId) {
        log.info("Getting messages for conversation: {} by user: {}", conversationId, userId);
        
        // Verify user has access to the conversation
        conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return conversationMapper.toMessageDtoList(messages);
    }

    @Override
    public MessageDto saveMessage(Long conversationId, String content, MessageRole role) {
        log.info("Saving message for conversation: {}, role: {}", conversationId, role);
        
        Message message = Message.builder()
                .conversationId(conversationId)
                .content(content)
                .role(role)
                .build();
        
        message = messageRepository.save(message);
        return conversationMapper.toMessageDto(message);
    }

    @Override
    public void deleteConversationMessages(Long conversationId) {
        log.info("Deleting all messages for conversation: {}", conversationId);
        messageRepository.deleteByConversationId(conversationId);
    }
}