package com.example.legal_connect.controller;

import com.example.legal_connect.dto.conversation.*;
import com.example.legal_connect.entity.Conversation.ConversationType;
import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.ApiKeyValidationService;
import com.example.legal_connect.service.ConversationService;
import com.example.legal_connect.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
@Tag(name = "Conversation", description = "Conversation management APIs")
public class ConversationController {

    private final ConversationService conversationService;
    private final MessageService messageService;
    private final ApiKeyValidationService apiKeyValidationService;

    @PostMapping
    @Operation(summary = "Create a new conversation")
    public ResponseEntity<ConversationDto> createConversation(
            @Valid @RequestBody CreateConversationRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        ConversationDto conversation = conversationService.createConversation(request, userPrincipal.getId());
        return ResponseEntity.ok(conversation);
    }

    @GetMapping
    @Operation(summary = "Get all conversations for the authenticated user")
    public ResponseEntity<List<ConversationDto>> getUserConversations(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Parameter(description = "Filter by conversation type") 
            @RequestParam(required = false) ConversationType type) {
        
        List<ConversationDto> conversations;
        if (type != null) {
            conversations = conversationService.getUserConversationsByType(userPrincipal.getId(), type);
        } else {
            conversations = conversationService.getUserConversations(userPrincipal.getId());
        }
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/{conversationId}")
    @Operation(summary = "Get conversation by ID")
    public ResponseEntity<ConversationDto> getConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @Parameter(description = "Include messages and PDF document details") 
            @RequestParam(defaultValue = "false") boolean includeDetails) {
        
        ConversationDto conversation;
        if (includeDetails) {
            conversation = conversationService.getConversationWithDetails(conversationId, userPrincipal.getId());
        } else {
            conversation = conversationService.getConversationById(conversationId, userPrincipal.getId());
        }
        return ResponseEntity.ok(conversation);
    }

    @PutMapping("/{conversationId}/title")
    @Operation(summary = "Update conversation title")
    public ResponseEntity<ConversationDto> updateConversationTitle(
            @PathVariable Long conversationId,
            @RequestBody UpdateTitleRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        ConversationDto conversation = conversationService.updateConversationTitle(
                conversationId, userPrincipal.getId(), request.getTitle());
        return ResponseEntity.ok(conversation);
    }

    @DeleteMapping("/{conversationId}")
    @Operation(summary = "Delete conversation")
    public ResponseEntity<Void> deleteConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        conversationService.deleteConversation(conversationId, userPrincipal.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{conversationId}/messages")
    @Operation(summary = "Get all messages for a conversation")
    public ResponseEntity<List<MessageDto>> getConversationMessages(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        List<MessageDto> messages = messageService.getConversationMessages(conversationId, userPrincipal.getId());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages")
    @Operation(summary = "Send a message to a conversation")
    public ResponseEntity<MessageDto> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        // Validate and deduct API key for chat
        apiKeyValidationService.validateAndUseApiKey(userPrincipal.getId(), "chat");
        
        MessageDto response = messageService.sendMessage(request, userPrincipal.getId());
        return ResponseEntity.ok(response);
    }

    public static class UpdateTitleRequest {
        private String title;
        
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
    }
}