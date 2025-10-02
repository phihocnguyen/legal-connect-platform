package com.example.legal_connect.service;

import com.example.legal_connect.dto.auth.RegisterRequest;
import com.example.legal_connect.dto.user.UserProfileDto;
import com.example.legal_connect.dto.user.UserPostDto;
import com.example.legal_connect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface UserService {
    
    User createUser(RegisterRequest request);
    
    Optional<User> findByEmail(String email);

    User findOrCreateOAuth2User(String email, String name, String providerId, String picture);

    boolean existsByEmail(String email);
    
    UserProfileDto getUserProfile(Long userId);
    
    Page<UserPostDto> getUserPosts(Long userId, Pageable pageable);
}
