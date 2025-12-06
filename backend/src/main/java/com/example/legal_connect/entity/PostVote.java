package com.example.legal_connect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;

@Entity
@Table(name = "post_votes", 
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"post_id", "user_id"})
    },
    indexes = {
        // Index on post_id for faster vote counting
        @Index(name = "idx_post_votes_post_id", columnList = "post_id"),
        
        // Index on user_id for user's voting history
        @Index(name = "idx_post_votes_user_id", columnList = "user_id"),
        
        // Composite index for finding user's vote on a post
        @Index(name = "idx_post_votes_post_user", columnList = "post_id, user_id")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostVote {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VoteType voteType;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum VoteType {
        UPVOTE, DOWNVOTE
    }
}

