package com.example.legal_connect.controller.chat;

import com.example.legal_connect.dto.chat.ChatMessage;
import com.example.legal_connect.dto.chat.OnlineUsersResponse;
import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.OnlineUserService;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Controller
@RequestMapping("/api/chat")
public class ChatController {

    private final OnlineUserService onlineUserService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(OnlineUserService onlineUserService, SimpMessagingTemplate messagingTemplate) {
        this.onlineUserService = onlineUserService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Xử lý khi user join chat
     */
    @MessageMapping("/chat.join")
    @SendTo("/topic/public")
    public ChatMessage joinChat(Principal principal, SimpMessageHeaderAccessor headerAccessor) {
        UserPrincipal userPrincipal = getUserFromPrincipal(principal);
        if (userPrincipal == null) {
            log.warn("Unauthorized join attempt");
            return null;
        }

        String userId = userPrincipal.getId().toString();
        String userName = userPrincipal.getFullName();
        
        // Add user to session attributes
        headerAccessor.getSessionAttributes().put("userId", userId);
        headerAccessor.getSessionAttributes().put("userName", userName);

        log.info("User {} joined chat", userName);

        ChatMessage chatMessage = ChatMessage.builder()
                .id(UUID.randomUUID().toString())
                .senderId(userId)
                .senderName(userName)
                .type(ChatMessage.MessageType.JOIN)
                .timestamp(LocalDateTime.now())
                .content(userName + " joined the chat")
                .build();

        return chatMessage;
    }

    /**
     * Xử lý tin nhắn chat công khai
     */
    @MessageMapping("/chat.send")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage chatMessage, Principal principal) {
        UserPrincipal userPrincipal = getUserFromPrincipal(principal);
        if (userPrincipal == null) {
            log.warn("Unauthorized message attempt");
            return null;
        }

        String userId = userPrincipal.getId().toString();
        String userName = userPrincipal.getFullName();
        
        log.info("Message from {} to public: {}", userName, chatMessage.getContent());

        chatMessage.setSenderId(userId);
        chatMessage.setSenderName(userName);
        chatMessage.setType(ChatMessage.MessageType.CHAT);
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setId(UUID.randomUUID().toString());

        // Update last seen của sender
        onlineUserService.updateLastSeen(userId);

        return chatMessage;
    }

    /**
     * Xử lý tin nhắn chat riêng tư (1-1)
     */
    @MessageMapping("/chat.private")
    public void sendPrivateMessage(@Payload ChatMessage chatMessage, Principal principal) {
        UserPrincipal userPrincipal = getUserFromPrincipal(principal);
        if (userPrincipal == null) {
            log.warn("Unauthorized private message attempt");
            return;
        }

        String userId = userPrincipal.getId().toString();
        String userName = userPrincipal.getFullName();
        
        log.info("Private message from {} to {}: {}", 
                userName, chatMessage.getReceiverId(), chatMessage.getContent());

        chatMessage.setSenderId(userId);
        chatMessage.setSenderName(userName);
        chatMessage.setType(ChatMessage.MessageType.CHAT);
        chatMessage.setTimestamp(LocalDateTime.now());
        chatMessage.setId(UUID.randomUUID().toString());

        // Update last seen của sender
        onlineUserService.updateLastSeen(userId);

        // Gửi tin nhắn tới receiver
        messagingTemplate.convertAndSendToUser(
                chatMessage.getReceiverId(),
                "/queue/private",
                chatMessage
        );

        // Gửi tin nhắn tới sender để confirm
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/private",
                chatMessage
        );
    }

    /**
     * Xử lý khi user đang typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload ChatMessage chatMessage, Principal principal) {
        UserPrincipal userPrincipal = getUserFromPrincipal(principal);
        if (userPrincipal == null) return;

        String userId = userPrincipal.getId().toString();
        String userName = userPrincipal.getFullName();
        
        log.debug("User {} is typing to {}", userName, chatMessage.getReceiverId());

        chatMessage.setSenderId(userId);
        chatMessage.setSenderName(userName);
        chatMessage.setType(ChatMessage.MessageType.TYPING);
        chatMessage.setTimestamp(LocalDateTime.now());

        if (chatMessage.getReceiverId() != null) {
            // Private typing indicator
            messagingTemplate.convertAndSendToUser(
                    chatMessage.getReceiverId(),
                    "/queue/typing",
                    chatMessage
            );
        } else {
            // Public typing indicator
            messagingTemplate.convertAndSend("/topic/typing", chatMessage);
        }
    }

    /**
     * Xử lý khi user dừng typing
     */
    @MessageMapping("/chat.stop-typing")
    public void handleStopTyping(@Payload ChatMessage chatMessage, Principal principal) {
        UserPrincipal userPrincipal = getUserFromPrincipal(principal);
        if (userPrincipal == null) return;

        String userId = userPrincipal.getId().toString();
        String userName = userPrincipal.getFullName();
        
        log.debug("User {} stopped typing to {}", userName, chatMessage.getReceiverId());

        chatMessage.setSenderId(userId);
        chatMessage.setSenderName(userName);
        chatMessage.setType(ChatMessage.MessageType.STOP_TYPING);
        chatMessage.setTimestamp(LocalDateTime.now());

        if (chatMessage.getReceiverId() != null) {
            // Private stop typing indicator
            messagingTemplate.convertAndSendToUser(
                    chatMessage.getReceiverId(),
                    "/queue/typing",
                    chatMessage
            );
        } else {
            // Public stop typing indicator
            messagingTemplate.convertAndSend("/topic/typing", chatMessage);
        }
    }

    /**
     * API endpoint để lấy danh sách user online (REST API)
     */
    @GetMapping("/online-users")
    @ResponseBody
    public OnlineUsersResponse getOnlineUsers() {
        return onlineUserService.getOnlineUsers();
    }

    /**
     * Message mapping để client có thể request danh sách user online qua WebSocket
     */
    @MessageMapping("/users.online")
    @SendTo("/topic/online-users")
    public OnlineUsersResponse requestOnlineUsers() {
        return onlineUserService.getOnlineUsers();
    }

    /**
     * Helper method để lấy UserPrincipal từ Principal
     */
    private UserPrincipal getUserFromPrincipal(Principal principal) {
        if (principal instanceof Authentication) {
            Authentication authentication = (Authentication) principal;
            if (authentication.getPrincipal() instanceof UserPrincipal) {
                return (UserPrincipal) authentication.getPrincipal();
            }
        }
        return null;
    }
}