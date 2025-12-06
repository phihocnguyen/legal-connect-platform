package com.example.legal_connect.repository;

import com.example.legal_connect.entity.PostLabel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostLabelRepository extends JpaRepository<PostLabel, Long> {
    
    Optional<PostLabel> findBySlug(String slug);
    
    List<PostLabel> findByIsActiveTrue();
    
    boolean existsBySlug(String slug);
}
