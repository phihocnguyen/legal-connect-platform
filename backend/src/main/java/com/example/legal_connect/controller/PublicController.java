package com.example.legal_connect.controller;

import com.example.legal_connect.dto.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public")
@Tag(name = "Public", description = "Public APIs")
public class PublicController {

    @GetMapping("/health")
    @Operation(summary = "Health check")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Server is running"));
    }

    @GetMapping("/oauth2/urls")
    @Operation(summary = "Get OAuth2 URLs")
    public ResponseEntity<ApiResponse<Map<String, String>>> getOAuth2Urls() {
        Map<String, String> urls = new HashMap<>();
        urls.put("google", "/oauth2/authorization/google");
        return ResponseEntity.ok(ApiResponse.success("OAuth2 URLs", urls));
    }
}
