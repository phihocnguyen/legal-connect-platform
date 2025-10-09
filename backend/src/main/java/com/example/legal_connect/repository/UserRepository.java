package com.example.legal_connect.repository;

import com.example.legal_connect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByProviderIdAndAuthProvider(String providerId, User.AuthProvider authProvider);
    long countByCreatedAtAfter(LocalDateTime since);
    
    // Admin management methods
    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String fullName, String email, Pageable pageable);
    Page<User> findByRole(User.Role role, Pageable pageable);
    
    // Dashboard statistics methods
    long countByRole(User.Role role);
    List<User> findTop5ByOrderByCreatedAtDesc();
    
    // Chart data methods
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByRoleAndCreatedAtBetween(User.Role role, LocalDateTime start, LocalDateTime end);
    
    // Temporarily disabled lastLogin methods to fix cached plan issue
    // default long countByLastLoginAfter(LocalDateTime since) {
    //     return count(); // Return total count for now
    // }
    // 
    // default long countByRoleAndLastLoginAfter(User.Role role, LocalDateTime since) {
    //     return countByRole(role); // Return role count for now
    // }
}
