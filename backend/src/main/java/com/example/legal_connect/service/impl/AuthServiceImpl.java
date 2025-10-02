package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.auth.LoginRequest;
import com.example.legal_connect.dto.auth.RegisterRequest;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.AuthService;
import com.example.legal_connect.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    @Override
    public User register(RegisterRequest request) {
        return userService.createUser(request);
    }

    @Override
    public User login(LoginRequest request, HttpServletRequest httpRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userService.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }
}
