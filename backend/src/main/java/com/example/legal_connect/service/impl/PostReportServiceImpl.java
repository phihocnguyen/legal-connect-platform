package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.forum.PostReportCreateDto;
import com.example.legal_connect.dto.forum.PostReportDto;
import com.example.legal_connect.entity.Post;
import com.example.legal_connect.entity.PostReport;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.mapper.PostReportMapper;
import com.example.legal_connect.repository.ForumRepository;
import com.example.legal_connect.repository.PostReportRepository;
import com.example.legal_connect.repository.UserRepository;
import com.example.legal_connect.service.PostReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class PostReportServiceImpl implements PostReportService {
    
    private final PostReportRepository reportRepository;
    private final ForumRepository postRepository;
    private final UserRepository userRepository;
    private final PostReportMapper reportMapper;
    
    @Override
    public PostReportDto createReport(Long postId, PostReportCreateDto reportDto, Long reporterId) {
        // Check if post exists
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
        
        // Check if user exists
        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Check if user already reported this post
        if (reportRepository.existsByPostIdAndReporterId(postId, reporterId)) {
            throw new RuntimeException("Bạn đã báo cáo bài viết này rồi");
        }
        
        // Create report
        PostReport report = PostReport.builder()
                .post(post)
                .reporter(reporter)
                .reason(reportDto.getReason())
                .description(reportDto.getDescription())
                .status(PostReport.ReportStatus.PENDING)
                .build();
        
        report = reportRepository.save(report);
        
        // Update post report count
        post.addReport();
        postRepository.save(post);
        
        return reportMapper.toDto(report);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<PostReportDto> getAllReports(Pageable pageable) {
        return reportRepository.findAll(pageable)
                .map(reportMapper::toDto);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PostReportDto> getReportsByStatus(String status) {
        PostReport.ReportStatus reportStatus;
        try {
            reportStatus = PostReport.ReportStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái báo cáo không hợp lệ");
        }
        
        return reportRepository.findAllByStatusWithDetails(reportStatus)
                .stream()
                .map(reportMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PostReportDto> getReportsByPostId(Long postId) {
        return reportRepository.findByPostIdOrderByCreatedAtDesc(postId)
                .stream()
                .map(reportMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public PostReportDto getReportById(Long reportId) {
        PostReport report = reportRepository.findByIdWithDetails(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));
        return reportMapper.toDto(report);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<PostReportDto> getUserReports(Long userId) {
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(reportMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Override
    @Transactional(readOnly = true)
    public boolean hasUserReportedPost(Long postId, Long userId) {
        return reportRepository.existsByPostIdAndReporterId(postId, userId);
    }
    
    @Override
    public PostReportDto updateReportStatus(Long reportId, String status, String reviewNote, Long reviewerId) {
        PostReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy báo cáo"));
        
        PostReport.ReportStatus reportStatus;
        try {
            reportStatus = PostReport.ReportStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Trạng thái báo cáo không hợp lệ");
        }
        
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người xem xét"));
        
        report.setStatus(reportStatus);
        report.setReviewNote(reviewNote);
        report.setReviewedBy(reviewer);
        report.setReviewedAt(LocalDateTime.now());
        
        report = reportRepository.save(report);
        
        return reportMapper.toDto(report);
    }
    
    @Override
    @Transactional(readOnly = true)
    public long countPendingReports() {
        return reportRepository.countByStatus(PostReport.ReportStatus.PENDING);
    }
}

