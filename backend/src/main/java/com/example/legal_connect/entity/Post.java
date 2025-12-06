package com.example.legal_connect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.BatchSize;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(name = "posts", indexes = {
    // Index on category_id for filtering posts by category
    @Index(name = "idx_posts_category_id", columnList = "category_id"),
    
    // Index on author_id for filtering posts by author
    @Index(name = "idx_posts_author_id", columnList = "author_id"),
    
    // Index on is_active for filtering active posts
    @Index(name = "idx_posts_is_active", columnList = "is_active"),
    
    // Index on created_at for sorting by date (DESC)
    @Index(name = "idx_posts_created_at", columnList = "created_at DESC"),
    
    // Composite index for common query pattern (active posts sorted by date)
    @Index(name = "idx_posts_active_created", columnList = "is_active, created_at DESC"),
    
    // Composite index for category filtering with active status
    @Index(name = "idx_posts_category_active_created", columnList = "category_id, is_active, created_at DESC"),
    
    // Index for views sorting
    @Index(name = "idx_posts_views", columnList = "views DESC"),
    
    // Index for reply count sorting
    @Index(name = "idx_posts_reply_count", columnList = "reply_count DESC")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    // Relationship with PostCategory
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private PostCategory category;
    
    // Relationship with User (author)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;
    
    @Column(name = "views", columnDefinition = "INTEGER DEFAULT 0")
    private Integer views = 0;
    
    @Column(name = "reply_count", columnDefinition = "INTEGER DEFAULT 0")
    private Integer replyCount = 0;
    
    @Column(name = "upvote_count", columnDefinition = "INTEGER DEFAULT 0")
    private Integer upvoteCount = 0;
    
    @Column(name = "downvote_count", columnDefinition = "INTEGER DEFAULT 0")
    private Integer downvoteCount = 0;
    
    @Column(name = "is_pinned")
    private Boolean pinned = false;
    
    @Column(name = "is_solved")
    private Boolean solved = false;
    
    @Column(name = "is_hot")
    private Boolean isHot = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    // Report management fields
    @Column(name = "report_count", columnDefinition = "INTEGER DEFAULT 0")
    private Integer reportCount = 0;
    
    @Column(name = "is_reported")
    private Boolean isReported = false;
    
    @Column(name = "violation_reason")
    private String violationReason;

    // Tags stored as comma-separated string for simplicity
    @Column(name = "tags")
    private String tags;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "last_reply_at")
    private LocalDateTime lastReplyAt;
    
    // Relationship with PostReply
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PostReply> replies;
    
    // Relationship with PostVote
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PostVote> votes;
    
    // Relationship with PostLabel (Many-to-Many)
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "post_label_mapping",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "label_id")
    )
    @BatchSize(size = 25)
    private Set<PostLabel> labels = new HashSet<>();
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Utility methods for tags
    public Set<String> getTagsSet() {
        if (tags == null || tags.trim().isEmpty()) {
            return new HashSet<>();
        }
        return Set.of(tags.split(","));
    }
    
    public void setTagsFromSet(Set<String> tagsSet) {
        this.tags = tagsSet != null ? String.join(",", tagsSet) : null;
    }
    
    // Helper method to increment views
    public void incrementViews() {
        this.views = (this.views != null ? this.views : 0) + 1;
    }
    
    // Helper method to update reply count
    public void updateReplyCount() {
        this.replyCount = replies != null ? replies.size() : 0;
    }
    
    // Helper method to update last reply time
    public void updateLastReplyTime() {
        this.lastReplyAt = LocalDateTime.now();
    }
    
    // Helper methods for report management
    public void addReport() {
        this.reportCount = (this.reportCount != null ? this.reportCount : 0) + 1;
        this.isReported = true;
    }
    
    public void clearReports() {
        this.reportCount = 0;
        this.isReported = false;
        this.violationReason = null;
    }
    
    public boolean hasReports() {
        return this.reportCount != null && this.reportCount > 0;
    }
}