package com.example.legal_connect.dto.conversation;

import com.example.legal_connect.entity.Conversation.ConversationType;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private Long id;
    private Long userId;
    private ConversationType type;
    private String title;
    private String summary;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<MessageDto> messages;
    private PdfDocumentDto pdfDocument;
    private int messageCount;
}