package com.example.legal_connect.service;

import com.example.legal_connect.dto.auth.LoginRequest;
import com.example.legal_connect.dto.auth.RegisterRequest;
import com.example.legal_connect.entity.User;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthService {
    
    User register(RegisterRequest request);
    
    User login(LoginRequest request, HttpServletRequest httpRequest);
    
    void logout(HttpServletRequest request);
}
