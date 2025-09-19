package com.example.legal_connect.service;

import com.example.legal_connect.dto.auth.RegisterRequest;
import com.example.legal_connect.entity.User;

import java.util.Optional;

public interface UserService {
    
    User createUser(RegisterRequest request);
    
    Optional<User> findByEmail(String email);

    User findOrCreateOAuth2User(String email, String name, String providerId, String picture);

    boolean existsByEmail(String email);
}
