package com.example.legal_connect.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class PythonMLClient {

    private final RestTemplate restTemplate;
    
    @Value("${app.ml.url}")
    private String mlServiceUrl;

    public PythonMLClient() {
        this.restTemplate = new RestTemplate();
    }

    public SentimentResult analyzeSentiment(String text) {
        String url = mlServiceUrl + "/sentiment/analyze";
        try {
            log.info("Calling Python ML service for sentiment analysis at: {}", url);
            return restTemplate.postForObject(url, Map.of("text", text), SentimentResult.class);
        } catch (Exception e) {
            log.error("Error calling Python ML service: {}", e.getMessage());
            return null;
        }
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SentimentResult {
        private String text;
        private String sentiment; // "positive", "neutral", "negative"
        private String label;
        private double score;
    }
}
