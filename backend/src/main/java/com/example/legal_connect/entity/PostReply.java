package com.example.legal_connect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "post_replies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostReply {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    // Relationship with Post
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
    
    // Relationship with User (author)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    // Self-referencing for nested replies
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private PostReply parent;
    
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PostReply> children;
    
    // Relationship with ReplyVote
    @OneToMany(mappedBy = "reply", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReplyVote> votes;
    
    // Relationship with Mention
    @OneToMany(mappedBy = "reply", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Mention> mentions;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "is_solution")
    private Boolean isSolution = false; // Mark reply as solution to the post
    
    @Column(name = "upvote_count", columnDefinition = "INTEGER DEFAULT 0")
    private Integer upvoteCount = 0;
    
    @Column(name = "downvote_count", columnDefinition = "INTEGER DEFAULT 0")
    private Integer downvoteCount = 0;
    
    @Column(name = "mentioned_user_ids")
    private String mentionedUserIds; // Comma-separated user IDs
    
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
    
    // Helper methods
    public boolean isTopLevel() {
        return parent == null;
    }
    
    public boolean hasChildren() {
        return children != null && !children.isEmpty();
    }
    
    public int getChildrenCount() {
        return children != null ? children.size() : 0;
    }
}