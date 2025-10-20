package com.example.legal_connect.repository;

import com.example.legal_connect.entity.PostReport;
import com.example.legal_connect.entity.PostReport.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostReportRepository extends JpaRepository<PostReport, Long> {
    
    // Find all reports for a specific post
    List<PostReport> findByPostIdOrderByCreatedAtDesc(Long postId);
    
    // Find reports by status
    Page<PostReport> findByStatusOrderByCreatedAtDesc(ReportStatus status, Pageable pageable);
    
    // Find reports by reporter
    List<PostReport> findByReporterIdOrderByCreatedAtDesc(Long reporterId);
    
    // Check if user already reported a post
    boolean existsByPostIdAndReporterId(Long postId, Long reporterId);
    
    // Count pending reports
    long countByStatus(ReportStatus status);
    
    // Get all pending reports with post and reporter details
    @Query("SELECT pr FROM PostReport pr " +
           "LEFT JOIN FETCH pr.post p " +
           "LEFT JOIN FETCH pr.reporter r " +
           "WHERE pr.status = :status " +
           "ORDER BY pr.createdAt DESC")
    List<PostReport> findAllByStatusWithDetails(@Param("status") ReportStatus status);
    
    // Find report by id with all details
    @Query("SELECT pr FROM PostReport pr " +
           "LEFT JOIN FETCH pr.post " +
           "LEFT JOIN FETCH pr.reporter " +
           "LEFT JOIN FETCH pr.reviewedBy " +
           "WHERE pr.id = :id")
    Optional<PostReport> findByIdWithDetails(@Param("id") Long id);
}

