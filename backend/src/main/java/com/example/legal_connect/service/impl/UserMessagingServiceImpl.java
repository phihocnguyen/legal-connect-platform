package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.messaging.*;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.entity.UserConversation;
import com.example.legal_connect.entity.UserMessage;
import com.example.legal_connect.repository.UserConversationRepository;
import com.example.legal_connect.repository.UserMessageRepository;
import com.example.legal_connect.repository.UserRepository;
import com.example.legal_connect.service.UserMessagingService;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserMessagingServiceImpl implements UserMessagingService {
    
    private final UserConversationRepository userConversationRepository;
    private final UserMessageRepository userMessageRepository;
    private final UserRepository userRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<UserConversationDto> getUserConversations(Long userId) {
        List<UserConversation> conversations = userConversationRepository.findByUserIdOrderByLastMessageAtDesc(userId);
        return conversations.stream()
                .map(conversation -> mapToConversationDto(conversation, userId))
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<UserMessageDto> getConversationMessages(Long conversationId, Long userId) {
        // Verify user has access to this conversation
        userConversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        List<UserMessage> messages = userMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messages.stream()
                .map(this::mapToMessageDto)
                .collect(Collectors.toList());
    }
    
    @Override
    public UserConversationDto createConversation(Long userId, CreateUserConversationRequest request) {
        User user1 = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user2 = userRepository.findById(request.getOtherUserId())
                .orElseThrow(() -> new RuntimeException("Other user not found"));
        
        if (userId.equals(request.getOtherUserId())) {
            throw new IllegalArgumentException("Cannot create conversation with yourself");
        }
        
        // Check if conversation already exists
        return userConversationRepository.findByUsers(userId, request.getOtherUserId())
                .map(existing -> mapToConversationDto(existing, userId))
                .orElseGet(() -> {
                    UserConversation newConversation = UserConversation.builder()
                            .user1(user1)
                            .user2(user2)
                            .isActive(true)
                            .build();
                    
                    UserConversation saved = userConversationRepository.save(newConversation);
                    return mapToConversationDto(saved, userId);
                });
    }
    
    @Override
    public UserConversationDto getOrCreateConversation(Long user1Id, Long user2Id) {
        if (user1Id.equals(user2Id)) {
            throw new IllegalArgumentException("Cannot create conversation with yourself");
        }
        
        return userConversationRepository.findByUsers(user1Id, user2Id)
                .map(existing -> mapToConversationDto(existing, user1Id))
                .orElseGet(() -> {
                    User user1 = userRepository.findById(user1Id)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    User user2 = userRepository.findById(user2Id)
                            .orElseThrow(() -> new RuntimeException("Other user not found"));
                    
                    UserConversation newConversation = UserConversation.builder()
                            .user1(user1)
                            .user2(user2)
                            .isActive(true)
                            .build();
                    
                    UserConversation saved = userConversationRepository.save(newConversation);
                    return mapToConversationDto(saved, user1Id);
                });
    }
    
    @Override
    public UserMessageDto sendMessage(Long userId, SendUserMessageRequest request) {
        UserConversation conversation = userConversationRepository.findByIdAndUserId(request.getConversationId(), userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        
        UserMessage message = UserMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .content(request.getContent())
                .isRead(false)
                .isActive(true)
                .build();
        
        UserMessage savedMessage = userMessageRepository.save(message);
        
        // Update conversation's last message time
        conversation.setLastMessageAt(savedMessage.getCreatedAt());
        userConversationRepository.save(conversation);
        
        return mapToMessageDto(savedMessage);
    }
    
    @Override
    public void markMessagesAsRead(Long conversationId, Long userId) {
        // Verify user has access to this conversation
        userConversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        userMessageRepository.markMessagesAsRead(conversationId, userId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserConversationDto getConversationById(Long conversationId, Long userId) {
        UserConversation conversation = userConversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        return mapToConversationDto(conversation, userId);
    }
    
    private UserConversationDto mapToConversationDto(UserConversation conversation, Long currentUserId) {
        // Determine the other participant
        User otherUser = conversation.getUser1().getId().equals(currentUserId) 
                ? conversation.getUser2() 
                : conversation.getUser1();
        
        UserConversationDto.ParticipantDto participant = UserConversationDto.ParticipantDto.builder()
                .id(otherUser.getId())
                .name(otherUser.getFullName())
                .email(otherUser.getEmail())
                .avatar(otherUser.getAvatar())
                .role(otherUser.getRole())
                .online(false) // TODO: Implement online status tracking
                .build();
        
        // Get last message info
        List<UserMessage> lastMessages = userMessageRepository.findByConversationIdOrderByCreatedAtDesc(conversation.getId());
        UserConversationDto.LastMessageDto lastMessage = null;
        if (!lastMessages.isEmpty()) {
            UserMessage lastMsg = lastMessages.get(0);
            lastMessage = UserConversationDto.LastMessageDto.builder()
                    .content(lastMsg.getContent())
                    .timestamp(lastMsg.getCreatedAt())
                    .senderId(lastMsg.getSender().getId())
                    .build();
        }
        
        // Count unread messages
        int unreadCount = (int) userMessageRepository.countUnreadMessages(conversation.getId(), currentUserId);
        
        return UserConversationDto.builder()
                .id(conversation.getId())
                .participant(participant)
                .lastMessage(lastMessage)
                .unreadCount(unreadCount)
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .build();
    }
    
    private UserMessageDto mapToMessageDto(UserMessage message) {
        return UserMessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversation().getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getFullName())
                .senderAvatar(message.getSender().getAvatar())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}