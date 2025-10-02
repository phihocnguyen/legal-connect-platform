package com.example.legal_connect.controller;

import com.example.legal_connect.dto.apikey.ApiKeyDto;
import com.example.legal_connect.dto.apikey.ApiKeyUsageRequest;
import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.ApiKeyService;
import com.example.legal_connect.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/api-keys")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "API Key", description = "API Key management APIs")
@CrossOrigin(origins = {"http://localhost:3000"})
public class ApiKeyController {

    private final ApiKeyService apiKeyService;
    private final UserService userService;

    @PostMapping
    @Operation(summary = "Create new API key")
    public ResponseEntity<ApiResponse<ApiKeyDto>> createApiKey(Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            ApiKeyDto apiKey = apiKeyService.createApiKey(user);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.<ApiKeyDto>builder()
                            .success(true)
                            .message("API key created successfully")
                            .data(apiKey)
                            .build());
        } catch (RuntimeException e) {
            log.error("Error creating API key: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<ApiKeyDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user's API key")
    public ResponseEntity<ApiResponse<ApiKeyDto>> getMyApiKey(Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            ApiKeyDto apiKey = apiKeyService.getApiKeyByUser(user);
            
            return ResponseEntity.ok(ApiResponse.<ApiKeyDto>builder()
                    .success(true)
                    .message("API key retrieved successfully")
                    .data(apiKey)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error getting API key: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<ApiKeyDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @PutMapping("/use")
    @Operation(summary = "Use API key (increment usage count)")
    public ResponseEntity<ApiResponse<ApiKeyDto>> useApiKey(
            @RequestBody ApiKeyUsageRequest request,
            Authentication authentication) {
        try {
            User user = getUserFromAuthentication(authentication);
            ApiKeyDto apiKey = apiKeyService.useApiKey(user, request.getType());
            
            return ResponseEntity.ok(ApiResponse.<ApiKeyDto>builder()
                    .success(true)
                    .message("API key used successfully")
                    .data(apiKey)
                    .build());
        } catch (RuntimeException e) {
            log.error("Error using API key: {}", e.getMessage());
            
            // Return 429 if limit exceeded
            if (e.getMessage().contains("limit exceeded") || e.getMessage().contains("expired")) {
                return ResponseEntity.status(429)
                        .body(ApiResponse.<ApiKeyDto>builder()
                                .success(false)
                                .message(e.getMessage())
                                .build());
            }
            
            return ResponseEntity.badRequest()
                    .body(ApiResponse.<ApiKeyDto>builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @GetMapping("/validate/{key}")
    @Operation(summary = "Validate API key")
    public ResponseEntity<ApiResponse<Boolean>> validateApiKey(@PathVariable String key) {
        try {
            boolean isValid = apiKeyService.validateApiKey(key);
            
            return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                    .success(true)
                    .message(isValid ? "API key is valid" : "API key is invalid or expired")
                    .data(isValid)
                    .build());
        } catch (Exception e) {
            log.error("Error validating API key: {}", e.getMessage());
            return ResponseEntity.ok(ApiResponse.<Boolean>builder()
                    .success(true)
                    .message("API key is invalid")
                    .data(false)
                    .build());
        }
    }

    private User getUserFromAuthentication(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("User not authenticated");
        }
        
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        return userService.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
