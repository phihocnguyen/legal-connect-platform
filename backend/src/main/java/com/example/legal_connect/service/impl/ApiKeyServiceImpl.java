package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.apikey.ApiKeyDto;
import com.example.legal_connect.entity.ApiKey;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.repository.ApiKeyRepository;
import com.example.legal_connect.service.ApiKeyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Base64;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ApiKeyServiceImpl implements ApiKeyService {

    private final ApiKeyRepository apiKeyRepository;
    private static final SecureRandom secureRandom = new SecureRandom();
    private static final Base64.Encoder base64Encoder = Base64.getUrlEncoder().withoutPadding();

    @Override
    public ApiKeyDto createApiKey(User user) {
        // Check if user already has an active API key
        var existingKey = apiKeyRepository.findByUserAndIsActiveTrue(user);
        if (existingKey.isPresent()) {
            return mapToDto(existingKey.get());
        }

        // Generate a new API key
        String key = generateApiKey();
        
        // Ensure key is unique
        while (apiKeyRepository.existsByKey(key)) {
            key = generateApiKey();
        }

        ApiKey apiKey = ApiKey.builder()
                .key(key)
                .user(user)
                .totalLimit(5)
                .usedCount(0)
                .pdfQaCount(0)
                .chatQaCount(0)
                .isActive(true)
                .build();

        apiKey = apiKeyRepository.save(apiKey);
        log.info("Created API key for user: {}", user.getEmail());
        
        return mapToDto(apiKey);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiKeyDto getApiKeyByUser(User user) {
        ApiKey apiKey = apiKeyRepository.findByUserAndIsActiveTrue(user)
                .orElseThrow(() -> new RuntimeException("API key not found. Please create one first."));
        
        return mapToDto(apiKey);
    }

    @Override
    public ApiKeyDto useApiKey(User user, String type) {
        ApiKey apiKey = apiKeyRepository.findByUserAndIsActiveTrue(user)
                .orElseThrow(() -> new RuntimeException("API key not found"));

        if (!apiKey.hasRemainingCalls()) {
            throw new RuntimeException("API key limit exceeded or expired");
        }

        apiKey.incrementUsage(type);
        apiKey = apiKeyRepository.save(apiKey);
        
        log.info("Used API key for user: {}, type: {}, remaining: {}", 
                 user.getEmail(), type, apiKey.getRemainingCalls());
        
        return mapToDto(apiKey);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateApiKey(String key) {
        return apiKeyRepository.findByKey(key)
                .map(ApiKey::hasRemainingCalls)
                .orElse(false);
    }

    @Override
    @Transactional(readOnly = true)
    public ApiKeyDto getApiKeyInfo(String key) {
        ApiKey apiKey = apiKeyRepository.findByKey(key)
                .orElseThrow(() -> new RuntimeException("Invalid API key"));
        
        return mapToDto(apiKey);
    }

    private String generateApiKey() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return "lc_" + base64Encoder.encodeToString(randomBytes);
    }

    private ApiKeyDto mapToDto(ApiKey apiKey) {
        return ApiKeyDto.builder()
                .id(apiKey.getId())
                .key(apiKey.getKey())
                .totalLimit(apiKey.getTotalLimit())
                .usedCount(apiKey.getUsedCount())
                .pdfQaCount(apiKey.getPdfQaCount())
                .chatQaCount(apiKey.getChatQaCount())
                .remainingCalls(apiKey.getRemainingCalls())
                .isActive(apiKey.getIsActive())
                .createdAt(apiKey.getCreatedAt())
                .expiresAt(apiKey.getExpiresAt())
                .build();
    }
}
