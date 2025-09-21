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
        log.info("Sending message for conversation: {} by user: {}", request.getConversationId(), userId);
        
        // Verify user has access to the conversation
        Conversation conversation = conversationRepository.findByIdAndUserId(request.getConversationId(), userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));
        
        // Save user message
        saveMessage(request.getConversationId(), request.getContent(), MessageRole.USER);
        
        // Here you would typically call an AI service to get a response
        // For now, we'll just return a placeholder response
        String aiResponse = generateAIResponse(request.getContent(), conversation.getType());
        MessageDto assistantMessage = saveMessage(request.getConversationId(), aiResponse, MessageRole.ASSISTANT);
        
        // Update conversation updated_at timestamp
        conversation.setUpdatedAt(java.time.LocalDateTime.now());
        conversationRepository.save(conversation);
        
        return assistantMessage;
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

    private String generateAIResponse(String userMessage, Conversation.ConversationType conversationType) {
        // TODO: Implement actual AI integration
        // This is a placeholder response
        if (conversationType == Conversation.ConversationType.PDF_QA) {
            return "Tôi đã phân tích tài liệu PDF của bạn. Dựa trên câu hỏi: \"" + userMessage + 
                   "\", tôi sẽ cần tham khảo nội dung tài liệu để đưa ra câu trả lời chính xác. " +
                   "Đây là phản hồi mẫu cho hệ thống PDF Q&A.";
        } else {
            return "Cảm ơn bạn đã hỏi: \"" + userMessage + "\". " +
                   "Tôi là trợ lý AI pháp lý và sẽ giúp bạn giải đáp các thắc mắc về luật. " +
                   "Đây là phản hồi mẫu cho hệ thống Q&A.";
        }
    }
}