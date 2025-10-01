package com.example.legal_connect.repository;

import com.example.legal_connect.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByProviderIdAndAuthProvider(String providerId, User.AuthProvider authProvider);
    long countByCreatedAtAfter(LocalDateTime since);
}
