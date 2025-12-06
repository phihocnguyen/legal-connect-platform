package com.example.legal_connect.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "post_labels", indexes = {
    // Index on slug for faster slug-based lookups
    @Index(name = "idx_post_labels_slug", columnList = "slug"),
    
    // Index on is_active for filtering active labels
    @Index(name = "idx_post_labels_is_active", columnList = "is_active"),
    
    // Index on name for search
    @Index(name = "idx_post_labels_name", columnList = "name")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostLabel {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    // Color for display (hex code, e.g., #FF5733)
    @Column(nullable = false)
    private String color = "#3B82F6";
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Many-to-many relationship with Posts
    @ManyToMany(mappedBy = "labels")
    private Set<Post> posts;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
