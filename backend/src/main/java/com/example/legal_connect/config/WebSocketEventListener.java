package com.example.legal_connect.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.OnlineUserService;

@Slf4j
@Component
public class WebSocketEventListener {

    private final OnlineUserService onlineUserService;

    public WebSocketEventListener(OnlineUserService onlineUserService) {
        this.onlineUserService = onlineUserService;
    }

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        log.info("WebSocket connection established - Session: {}", sessionId);
        
        Authentication authentication = (Authentication) headerAccessor.getUser();
        
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            
            String userId = userPrincipal.getId().toString();
            String userName = userPrincipal.getFullName();
            String userType = userPrincipal.getRole().name();
            String avatar = userPrincipal.getAvatar();
            
            headerAccessor.getSessionAttributes().put("userId", userId);
            headerAccessor.getSessionAttributes().put("userName", userName);
            headerAccessor.getSessionAttributes().put("userType", userType);
            
            onlineUserService.addUser(userId, userName, userType, sessionId, avatar);
            
            log.info("User {} ({}) connected via WebSocket - Session: {}", userName, userType, sessionId);
        } else {
            log.warn("WebSocket connection without valid authentication - Session: {}", sessionId);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String sessionId = headerAccessor.getSessionId();
        
        log.info("WebSocket connection closed - Session: {}", sessionId);
        onlineUserService.removeUserBySessionId(sessionId);
    }

    @EventListener
    public void handleSubscribeEvent(SessionSubscribeEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String destination = headerAccessor.getDestination();
        String sessionId = headerAccessor.getSessionId();
        
        log.debug("User subscribed to {} - Session: {}", destination, sessionId);
        
        if ("/topic/online-users".equals(destination)) {
            log.debug("User subscribed to online users topic");
        }
    }
}