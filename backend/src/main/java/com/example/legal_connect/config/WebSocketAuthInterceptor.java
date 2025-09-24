package com.example.legal_connect.config;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import jakarta.servlet.http.HttpSession;
import java.util.Map;

@Slf4j
@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor, HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            HttpServletRequest httpRequest = servletRequest.getServletRequest();
            HttpSession session = httpRequest.getSession(false);
            
            if (session != null) {
                Object securityContextObj = session.getAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
                if (securityContextObj != null) {
                    attributes.put("SPRING_SECURITY_CONTEXT", securityContextObj);
                    log.info("WebSocket handshake with authenticated session: {}", session.getId());
                    return true;
                }
            }
            
            log.warn("WebSocket handshake without valid session authentication");
        }
        
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            Object securityContextObj = accessor.getSessionAttributes().get("SPRING_SECURITY_CONTEXT");
            
            if (securityContextObj != null) {
                try {
                    SecurityContext securityContext = (SecurityContext) securityContextObj;

                    Authentication authentication = securityContext.getAuthentication();
                    
                    if (authentication != null && authentication.isAuthenticated()) {
                        accessor.setUser(authentication);
                        log.info("WebSocket CONNECT with authenticated user: {}", authentication.getName());
                    }
                } catch (Exception e) {
                    log.error("Error setting WebSocket authentication", e);
                }
            } else {
                log.warn("WebSocket CONNECT without authentication");
            }
        }
        
        return message;
    }
}