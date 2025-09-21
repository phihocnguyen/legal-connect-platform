package com.example.legal_connect.mapper;

import com.example.legal_connect.dto.conversation.ConversationDto;
import com.example.legal_connect.dto.conversation.MessageDto;
import com.example.legal_connect.dto.conversation.PdfDocumentDto;
import com.example.legal_connect.entity.Conversation;
import com.example.legal_connect.entity.Message;
import com.example.legal_connect.entity.PdfDocument;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ConversationMapper {

    public ConversationDto toDto(Conversation conversation) {
        if (conversation == null) {
            return null;
        }

        return ConversationDto.builder()
                .id(conversation.getId())
                .userId(conversation.getUserId())
                .type(conversation.getType())
                .title(conversation.getTitle())
                .summary(conversation.getSummary())
                .createdAt(conversation.getCreatedAt())
                .updatedAt(conversation.getUpdatedAt())
                .messageCount(conversation.getMessages() != null ? conversation.getMessages().size() : 0)
                .build();
    }

    public ConversationDto toDtoWithDetails(Conversation conversation) {
        if (conversation == null) {
            return null;
        }

        ConversationDto dto = toDto(conversation);
        
        if (conversation.getMessages() != null) {
            dto.setMessages(conversation.getMessages().stream()
                    .map(this::toMessageDto)
                    .collect(Collectors.toList()));
        }

        if (conversation.getPdfDocument() != null) {
            dto.setPdfDocument(toPdfDocumentDto(conversation.getPdfDocument()));
        }

        return dto;
    }

    public MessageDto toMessageDto(Message message) {
        if (message == null) {
            return null;
        }

        return MessageDto.builder()
                .id(message.getId())
                .conversationId(message.getConversationId())
                .content(message.getContent())
                .role(message.getRole())
                .createdAt(message.getCreatedAt())
                .build();
    }

    public PdfDocumentDto toPdfDocumentDto(PdfDocument pdfDocument) {
        if (pdfDocument == null) {
            return null;
        }

        return PdfDocumentDto.builder()
                .id(pdfDocument.getId())
                .conversationId(pdfDocument.getConversationId())
                .originalFileName(pdfDocument.getOriginalFileName())
                .filePath(pdfDocument.getFilePath())
                .fileSize(pdfDocument.getFileSize())
                .contentType(pdfDocument.getContentType())
                .uploadedAt(pdfDocument.getUploadedAt())
                .build();
    }

    public List<ConversationDto> toDtoList(List<Conversation> conversations) {
        return conversations.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<MessageDto> toMessageDtoList(List<Message> messages) {
        return messages.stream()
                .map(this::toMessageDto)
                .collect(Collectors.toList());
    }
}