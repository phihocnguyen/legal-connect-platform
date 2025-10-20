package com.example.legal_connect.controller;

import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.dto.forum.PostReportCreateDto;
import com.example.legal_connect.dto.forum.PostReportDto;
import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.PostReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Validated
@CrossOrigin(origins = {"http://localhost:3000"})
@Tag(name = "Post Report", description = "API quản lý báo cáo bài viết")
public class PostReportController {
    
    private final PostReportService reportService;
    
    @PostMapping("/posts/{postId}/reports")
    @Operation(summary = "Báo cáo bài viết", description = "Người dùng báo cáo bài viết vi phạm")
    public ResponseEntity<ApiResponse<PostReportDto>> createReport(
            @PathVariable Long postId,
            @Valid @RequestBody PostReportCreateDto reportDto,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        PostReportDto report = reportService.createReport(postId, reportDto, userPrincipal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã gửi báo cáo thành công", report));
    }
    
    @GetMapping("/posts/{postId}/reports/check")
    @Operation(summary = "Kiểm tra đã báo cáo", description = "Kiểm tra người dùng đã báo cáo bài viết chưa")
    public ResponseEntity<ApiResponse<Boolean>> checkUserReported(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        boolean hasReported = reportService.hasUserReportedPost(postId, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(hasReported));
    }
    
    @GetMapping("/user/reports")
    @Operation(summary = "Lấy báo cáo của người dùng", description = "Lấy danh sách báo cáo mà người dùng đã gửi")
    public ResponseEntity<ApiResponse<List<PostReportDto>>> getUserReports(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        List<PostReportDto> reports = reportService.getUserReports(userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success(reports));
    }
    
    // Admin endpoints
    @GetMapping("/admin/reports")
    @Operation(summary = "[Admin] Lấy tất cả báo cáo", description = "Admin lấy danh sách tất cả báo cáo")
    public ResponseEntity<ApiResponse<Page<PostReportDto>>> getAllReports(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        // TODO: Add role check for admin
        Page<PostReportDto> reports = reportService.getAllReports(pageable);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }
    
    @GetMapping("/admin/reports/status/{status}")
    @Operation(summary = "[Admin] Lấy báo cáo theo trạng thái", description = "Admin lấy báo cáo theo trạng thái (PENDING, REVIEWING, RESOLVED, REJECTED)")
    public ResponseEntity<ApiResponse<List<PostReportDto>>> getReportsByStatus(
            @PathVariable String status,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        // TODO: Add role check for admin
        List<PostReportDto> reports = reportService.getReportsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }
    
    @GetMapping("/admin/reports/{reportId}")
    @Operation(summary = "[Admin] Lấy chi tiết báo cáo", description = "Admin lấy chi tiết một báo cáo")
    public ResponseEntity<ApiResponse<PostReportDto>> getReportById(
            @PathVariable Long reportId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        // TODO: Add role check for admin
        PostReportDto report = reportService.getReportById(reportId);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
    
    @PutMapping("/admin/reports/{reportId}/status")
    @Operation(summary = "[Admin] Cập nhật trạng thái báo cáo", description = "Admin cập nhật trạng thái xử lý báo cáo")
    public ResponseEntity<ApiResponse<PostReportDto>> updateReportStatus(
            @PathVariable Long reportId,
            @RequestParam String status,
            @RequestParam(required = false) String reviewNote,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        // TODO: Add role check for admin
        PostReportDto report = reportService.updateReportStatus(reportId, status, reviewNote, userPrincipal.getId());
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật trạng thái báo cáo", report));
    }
    
    @GetMapping("/admin/reports/count/pending")
    @Operation(summary = "[Admin] Đếm báo cáo đang chờ", description = "Admin đếm số lượng báo cáo đang chờ xử lý")
    public ResponseEntity<ApiResponse<Long>> countPendingReports(
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        // TODO: Add role check for admin
        long count = reportService.countPendingReports();
        return ResponseEntity.ok(ApiResponse.success(count));
    }
    
    @GetMapping("/admin/posts/{postId}/reports")
    @Operation(summary = "[Admin] Lấy báo cáo của bài viết", description = "Admin lấy tất cả báo cáo của một bài viết")
    public ResponseEntity<ApiResponse<List<PostReportDto>>> getReportsByPostId(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        // TODO: Add role check for admin
        List<PostReportDto> reports = reportService.getReportsByPostId(postId);
        return ResponseEntity.ok(ApiResponse.success(reports));
    }
}
