package com.example.legal_connect.service;

import com.example.legal_connect.dto.apikey.ApiKeyDto;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApiKeyValidationService {

    private final ApiKeyService apiKeyService;
    private final UserRepository userRepository;

    /**
     * Validate and deduct API key for a user
     * @param userId User ID
     * @param type API type ("pdf" or "chat")
     * @throws RuntimeException if validation fails
     */
    public void validateAndUseApiKey(Long userId, String type) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Get or create API key
            ApiKeyDto apiKey;
            try {
                apiKey = apiKeyService.getApiKeyByUser(user);
            } catch (RuntimeException e) {
                apiKey = apiKeyService.createApiKey(user);
                log.info("Auto-created API key for user: {}", user.getEmail());
            }

            // Check if API key is valid and has remaining calls
            if (!apiKey.getIsActive()) {
                throw new RuntimeException("API key is not active");
            }

            if (apiKey.getRemainingCalls() <= 0) {
                throw new RuntimeException("API key limit exceeded. Please upgrade or wait for reset.");
            }

            // Deduct usage
            apiKeyService.useApiKey(user, type);
            log.info("Successfully validated and deducted API key for user: {}, type: {}, remaining: {}", 
                    user.getEmail(), type, apiKey.getRemainingCalls() - 1);

        } catch (Exception e) {
            log.error("API key validation failed: {}", e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }

    /**
     * Check if user has remaining API calls without deducting
     * @param userId User ID
     * @return true if user has remaining calls
     */
    public boolean hasRemainingCalls(Long userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            ApiKeyDto apiKey = apiKeyService.getApiKeyByUser(user);
            return apiKey.getIsActive() && apiKey.getRemainingCalls() > 0;
        } catch (Exception e) {
            return false;
        }
    }
}
