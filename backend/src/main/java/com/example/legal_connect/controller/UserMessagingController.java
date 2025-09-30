package com.example.legal_connect.controller;

import com.example.legal_connect.dto.messaging.*;
import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.UserMessagingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user-conversations")
@RequiredArgsConstructor
@Tag(name = "User Messaging", description = "User-to-user messaging APIs")
public class UserMessagingController {

    private final UserMessagingService userMessagingService;

    @GetMapping
    @Operation(summary = "Get all conversations for the authenticated user")
    public ResponseEntity<List<UserConversationDto>> getUserConversations(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        List<UserConversationDto> conversations = userMessagingService.getUserConversations(userPrincipal.getId());
        return ResponseEntity.ok(conversations);
    }

    @PostMapping
    @Operation(summary = "Create a new conversation with another user")
    public ResponseEntity<UserConversationDto> createConversation(
            @Valid @RequestBody CreateUserConversationRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        UserConversationDto conversation = userMessagingService.createConversation(userPrincipal.getId(), request);
        return ResponseEntity.ok(conversation);
    }

    @PostMapping("/get-or-create")
    @Operation(summary = "Get existing conversation or create new one with another user")
    public ResponseEntity<UserConversationDto> getOrCreateConversation(
            @RequestParam Long otherUserId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        UserConversationDto conversation = userMessagingService.getOrCreateConversation(
                userPrincipal.getId(), otherUserId);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/{conversationId}")
    @Operation(summary = "Get conversation by ID")
    public ResponseEntity<UserConversationDto> getConversation(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        UserConversationDto conversation = userMessagingService.getConversationById(
                conversationId, userPrincipal.getId());
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/{conversationId}/messages")
    @Operation(summary = "Get all messages for a conversation")
    public ResponseEntity<List<UserMessageDto>> getConversationMessages(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        List<UserMessageDto> messages = userMessagingService.getConversationMessages(
                conversationId, userPrincipal.getId());
        return ResponseEntity.ok(messages);
    }

    @PostMapping("/messages")
    @Operation(summary = "Send a message to a conversation")
    public ResponseEntity<UserMessageDto> sendMessage(
            @Valid @RequestBody SendUserMessageRequest request,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        UserMessageDto message = userMessagingService.sendMessage(userPrincipal.getId(), request);
        return ResponseEntity.ok(message);
    }

    @PutMapping("/{conversationId}/read")
    @Operation(summary = "Mark messages as read for a conversation")
    public ResponseEntity<Void> markMessagesAsRead(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        userMessagingService.markMessagesAsRead(conversationId, userPrincipal.getId());
        return ResponseEntity.ok().build();
    }
}