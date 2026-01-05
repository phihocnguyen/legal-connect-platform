package com.example.legal_connect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Table(name = "post_bookmarks", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"post_id", "user_id"})
    },
    indexes = {
        @Index(name = "idx_post_bookmarks_post_id", columnList = "post_id"),
        
        @Index(name = "idx_post_bookmarks_user_id", columnList = "user_id"),
        
        @Index(name = "idx_post_bookmarks_post_user", columnList = "post_id, user_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostBookmark {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

