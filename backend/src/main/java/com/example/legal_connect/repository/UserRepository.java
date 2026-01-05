package com.example.legal_connect.repository;

import com.example.legal_connect.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByFullName(String fullName);
    boolean existsByEmail(String email);
    Optional<User> findByProviderIdAndAuthProvider(String providerId, User.AuthProvider authProvider);
    long countByCreatedAtAfter(LocalDateTime since);
    
    Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
        String fullName, String email, Pageable pageable);
    Page<User> findByRole(User.Role role, Pageable pageable);
    List<User> findByRole(User.Role role);
    
    long countByRole(User.Role role);
    List<User> findTop5ByOrderByCreatedAtDesc();
    
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByRoleAndCreatedAtBetween(User.Role role, LocalDateTime start, LocalDateTime end);
    
    @Query("SELECT DATE(u.createdAt) as date, COUNT(u) as count " +
           "FROM User u " +
           "WHERE u.createdAt >= :startDate " +
           "GROUP BY DATE(u.createdAt) " +
           "ORDER BY date")
    List<Object[]> countUsersGroupedByDate(@Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT DATE(u.createdAt) as date, u.role, COUNT(u) as count " +
           "FROM User u " +
           "WHERE u.createdAt >= :startDate " +
           "GROUP BY DATE(u.createdAt), u.role " +
           "ORDER BY date, u.role")
    List<Object[]> countUsersByRoleGroupedByDate(@Param("startDate") LocalDateTime startDate);
    
}
