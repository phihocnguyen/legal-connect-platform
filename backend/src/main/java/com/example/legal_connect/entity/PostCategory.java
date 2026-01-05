package com.example.legal_connect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "post_categories", indexes = {
    @Index(name = "idx_post_categories_slug", columnList = "slug"),
    
    @Index(name = "idx_post_categories_is_active", columnList = "is_active"),
    
    @Index(name = "idx_post_categories_display_order", columnList = "display_order"),
    
    @Index(name = "idx_post_categories_active_order", columnList = "is_active, display_order")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostCategory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String slug;
    
    @Column(nullable = false)
    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String icon;
    
    @Column(name = "display_order")
    private Integer displayOrder = 0;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Post> posts;
    
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PostLabel> labels;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public int getThreadsCount() {
        return posts != null ? posts.size() : 0;
    }
    
    public int getTotalPostsCount() {
        if (posts == null) return 0;
        return posts.stream()
            .mapToInt(post -> 1 + (post.getReplies() != null ? post.getReplies().size() : 0))
            .sum();
    }
}