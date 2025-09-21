package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.conversation.*;
import com.example.legal_connect.entity.Conversation;
import com.example.legal_connect.entity.Conversation.ConversationType;
import com.example.legal_connect.entity.Message;
import com.example.legal_connect.mapper.ConversationMapper;
import com.example.legal_connect.repository.ConversationRepository;
import com.example.legal_connect.service.ConversationService;
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
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final MessageService messageService;
    private final ConversationMapper conversationMapper;

    @Override
    public ConversationDto createConversation(CreateConversationRequest request, Long userId) {
        log.info("Creating conversation for user: {}, type: {}", userId, request.getType());
        
        Conversation conversation = Conversation.builder()
                .userId(userId)
                .type(request.getType())
                .title(request.getTitle())
                .summary(request.getSummary())
                .build();
        
        conversation = conversationRepository.save(conversation);
        
        // If there's an initial message, save it
        if (request.getInitialMessage() != null && !request.getInitialMessage().trim().isEmpty()) {
            messageService.saveMessage(conversation.getId(), request.getInitialMessage(), Message.MessageRole.USER);
        }
        
        return conversationMapper.toDto(conversation);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversations(Long userId) {
        log.info("Getting conversations for user: {}", userId);
        
        List<Conversation> conversations = conversationRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        return conversationMapper.toDtoList(conversations);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversationsByType(Long userId, ConversationType type) {
        log.info("Getting conversations for user: {}, type: {}", userId, type);
        
        List<Conversation> conversations = conversationRepository.findByUserIdAndTypeOrderByUpdatedAtDesc(userId, type);
        return conversationMapper.toDtoList(conversations);
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationDto getConversationById(Long conversationId, Long userId) {
        log.info("Getting conversation: {} for user: {}", conversationId, userId);
        
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        return conversationMapper.toDto(conversation);
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationDto getConversationWithDetails(Long conversationId, Long userId) {
        log.info("Getting conversation with details: {} for user: {}", conversationId, userId);
        
        Conversation conversation = conversationRepository.findByIdAndUserIdWithDetails(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        return conversationMapper.toDtoWithDetails(conversation);
    }

    @Override
    public ConversationDto updateConversationTitle(Long conversationId, Long userId, String title) {
        log.info("Updating conversation title: {} for user: {}", conversationId, userId);
        
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        conversation.setTitle(title);
        conversation = conversationRepository.save(conversation);
        
        return conversationMapper.toDto(conversation);
    }

    @Override
    public void deleteConversation(Long conversationId, Long userId) {
        log.info("Deleting conversation: {} for user: {}", conversationId, userId);
        
        Conversation conversation = conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        conversationRepository.delete(conversation);
    }
}