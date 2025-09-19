package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.auth.RegisterRequest;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.mapper.UserMapper;
import com.example.legal_connect.repository.UserRepository;
import com.example.legal_connect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    @Override
    public User createUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        return userRepository.save(user);
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public User findOrCreateOAuth2User(String email, String name, String providerId) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update provider info if user exists but was created via local registration
            userMapper.updateUserFromOAuth2(user, name, providerId);
            return userRepository.save(user);
        }

        // Create new user for OAuth2
        User newUser = userMapper.createOAuth2User(email, name, providerId);
        newUser.setPassword(passwordEncoder.encode("oauth2-user-" + System.currentTimeMillis()));

        return userRepository.save(newUser);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
}
