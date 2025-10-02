package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.auth.RegisterRequest;
import com.example.legal_connect.dto.user.UserProfileDto;
import com.example.legal_connect.dto.user.UserPostDto;
import com.example.legal_connect.entity.Post;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.mapper.UserMapper;
import com.example.legal_connect.repository.ForumRepository;
import com.example.legal_connect.repository.PostReplyRepository;
import com.example.legal_connect.repository.UserRepository;
import com.example.legal_connect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    private final ForumRepository forumRepository;
    private final PostReplyRepository postReplyRepository;

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
    public User findOrCreateOAuth2User(String email, String name, String providerId, String picture) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            // Update provider info if user exists but was created via local registration
            userMapper.updateUserFromOAuth2(user, name, providerId, picture);
            return userRepository.save(user);
        }

        // Create new user for OAuth2
        User newUser = userMapper.createOAuth2User(email, name, providerId, picture);
        newUser.setPassword(passwordEncoder.encode("oauth2-user-" + System.currentTimeMillis()));

        return userRepository.save(newUser);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        long postCount = forumRepository.countByAuthorAndIsActiveTrue(user);
        long replyCount = postReplyRepository.countByAuthorAndIsActiveTrue(user);
        
        return UserProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatar(user.getAvatar())
                .role(user.getRole().name())
                .phoneNumber(user.getPhoneNumber())
                .postCount(postCount)
                .replyCount(replyCount)
                .joinedAt(user.getCreatedAt())
                .build();
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<UserPostDto> getUserPosts(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Page<Post> posts = forumRepository.findByAuthorAndIsActiveTrueOrderByCreatedAtDesc(user, pageable);
        
        return posts.map(post -> UserPostDto.builder()
                .id(post.getId())
                .title(post.getTitle())
                .content(post.getContent())
                .categoryName(post.getCategory().getName())
                .categorySlug(post.getCategory().getSlug())
                .views(post.getViews())
                .replyCount(post.getReplyCount())
                .pinned(post.getPinned())
                .solved(post.getSolved())
                .isHot(post.getIsHot())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build());
    }
}
