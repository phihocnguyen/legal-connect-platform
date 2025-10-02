package com.example.legal_connect.repository;

import com.example.legal_connect.entity.ApiKey;
import com.example.legal_connect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    
    Optional<ApiKey> findByKey(String key);
    
    Optional<ApiKey> findByUserAndIsActiveTrue(User user);
    
    boolean existsByKey(String key);
    
    long countByUserAndIsActiveTrue(User user);
    
    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}
