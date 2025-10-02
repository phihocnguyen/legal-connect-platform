package com.example.legal_connect.service;

import com.example.legal_connect.dto.apikey.ApiKeyDto;
import com.example.legal_connect.entity.User;

public interface ApiKeyService {
    
    ApiKeyDto createApiKey(User user);
    
    ApiKeyDto getApiKeyByUser(User user);
    
    ApiKeyDto useApiKey(User user, String type);
    
    boolean validateApiKey(String key);
    
    ApiKeyDto getApiKeyInfo(String key);
}
