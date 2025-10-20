package com.example.legal_connect.service;

import com.example.legal_connect.dto.forum.PostReportCreateDto;
import com.example.legal_connect.dto.forum.PostReportDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface PostReportService {
    
    // Create a report
    PostReportDto createReport(Long postId, PostReportCreateDto reportDto, Long reporterId);
    
    // Get all reports (for admin)
    Page<PostReportDto> getAllReports(Pageable pageable);
    
    // Get reports by status (for admin)
    List<PostReportDto> getReportsByStatus(String status);
    
    // Get reports for a specific post (for admin)
    List<PostReportDto> getReportsByPostId(Long postId);
    
    // Get report by id (for admin)
    PostReportDto getReportById(Long reportId);
    
    // Get user's reports
    List<PostReportDto> getUserReports(Long userId);
    
    // Check if user already reported a post
    boolean hasUserReportedPost(Long postId, Long userId);
    
    // Update report status (for admin)
    PostReportDto updateReportStatus(Long reportId, String status, String reviewNote, Long reviewerId);
    
    // Count pending reports (for admin)
    long countPendingReports();
}

