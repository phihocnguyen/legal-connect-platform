package com.example.legal_connect.controller;

import com.example.legal_connect.dto.admin.UserManagementDto;
import com.example.legal_connect.dto.admin.PostModerationDto;
import com.example.legal_connect.dto.admin.LawyerApplicationDto;
import com.example.legal_connect.dto.admin.AdminDashboardStatsDto;
import com.example.legal_connect.dto.admin.CategoryCreateDto;
import com.example.legal_connect.dto.admin.CategoryUpdateDto;
import com.example.legal_connect.dto.forum.PostCategoryDto;
import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.dto.analytics.*;
import com.example.legal_connect.service.AdminService;
import com.example.legal_connect.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Management", description = "Admin dashboard management APIs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final AnalyticsService analyticsService;

    // ========== DASHBOARD STATISTICS ==========
    
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<AdminDashboardStatsDto>> getDashboardStats() {
        log.info("Getting admin dashboard statistics");
        
        AdminDashboardStatsDto stats = adminService.getDashboardStatistics();
        
        return ResponseEntity.ok(ApiResponse.<AdminDashboardStatsDto>builder()
            .success(true)
            .message("Dashboard statistics retrieved successfully")
            .data(stats)
            .build());
    }

    // ========== USER MANAGEMENT ==========
    
    @GetMapping("/users")
    @Operation(summary = "Get all users for admin management")
    public ResponseEntity<ApiResponse<Page<UserManagementDto>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role) {
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? 
            Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<UserManagementDto> users = adminService.getAllUsers(search, role, pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<UserManagementDto>>builder()
            .success(true)
            .message("Users retrieved successfully")
            .data(users)
            .build());
    }

    @PutMapping("/users/{userId}/status")
    @Operation(summary = "Update user enabled/disabled status")
    public ResponseEntity<ApiResponse<String>> updateUserStatus(
            @PathVariable Long userId,
            @RequestParam Boolean isEnabled) {
        
        adminService.updateUserStatus(userId, isEnabled);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("User status updated successfully")
            .data("User " + (isEnabled ? "enabled" : "disabled"))
            .build());
    }

    // ========== POST MODERATION ==========
    
    @GetMapping("/posts")
    @Operation(summary = "Get posts for moderation")
    public ResponseEntity<ApiResponse<Page<PostModerationDto>>> getPostsForModeration(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive) {
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? 
            Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<PostModerationDto> posts = adminService.getPostsForModeration(search, isActive, pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<PostModerationDto>>builder()
            .success(true)
            .message("Posts retrieved successfully")
            .data(posts)
            .build());
    }

    @PutMapping("/posts/{postId}/status")
    @Operation(summary = "Update post active/inactive status")
    public ResponseEntity<ApiResponse<String>> updatePostStatus(
            @PathVariable Long postId,
            @RequestParam Boolean isActive) {
        
        adminService.updatePostStatus(postId, isActive);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("Post status updated successfully")
            .data("Post " + (isActive ? "activated" : "deactivated"))
            .build());
    }

    @DeleteMapping("/posts/{postId}")
    @Operation(summary = "Delete a post permanently")
    public ResponseEntity<ApiResponse<String>> deletePost(@PathVariable Long postId) {
        
        log.info("Deleting post ID: {}", postId);
        
        adminService.deletePost(postId);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("Post deleted successfully")
            .data("Post and associated replies have been removed")
            .build());
    }

    @PutMapping("/posts/{postId}/pin")
    @Operation(summary = "Pin or unpin a post")
    public ResponseEntity<ApiResponse<String>> updatePostPinStatus(
            @PathVariable Long postId,
            @RequestParam Boolean isPinned) {
        
        log.info("Updating post ID: {} pin status to: {}", postId, isPinned);
        
        adminService.updatePostPinStatus(postId, isPinned);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("Post pin status updated successfully")
            .data("Post " + (isPinned ? "pinned" : "unpinned"))
            .build());
    }

    @PutMapping("/posts/{postId}/hot")
    @Operation(summary = "Mark or unmark a post as hot")
    public ResponseEntity<ApiResponse<String>> updatePostHotStatus(
            @PathVariable Long postId,
            @RequestParam Boolean isHot) {
        
        log.info("Updating post ID: {} hot status to: {}", postId, isHot);
        
        adminService.updatePostHotStatus(postId, isHot);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("Post hot status updated successfully")
            .data("Post " + (isHot ? "marked as hot" : "unmarked as hot"))
            .build());
    }

    @GetMapping("/posts/{postId}")
    @Operation(summary = "Get post details for admin review")
    public ResponseEntity<ApiResponse<PostModerationDto>> getPostDetails(@PathVariable Long postId) {
        
        PostModerationDto post = adminService.getPostForModeration(postId);
        
        return ResponseEntity.ok(ApiResponse.<PostModerationDto>builder()
            .success(true)
            .message("Post details retrieved successfully")
            .data(post)
            .build());
    }

    
    @GetMapping("/violations")
    @Operation(summary = "Get reported posts for violation review")
    public ResponseEntity<ApiResponse<Page<PostModerationDto>>> getViolationPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive) {
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? 
            Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<PostModerationDto> violationPosts = adminService.getViolationPosts(search, isActive, pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<PostModerationDto>>builder()
            .success(true)
            .message("Violation posts retrieved successfully")
            .data(violationPosts)
            .build());
    }

    
    @GetMapping("/lawyer-applications")
    @Operation(summary = "Get lawyer applications for admin review")
    public ResponseEntity<ApiResponse<Page<LawyerApplicationDto>>> getLawyerApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? 
            Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<LawyerApplicationDto> applications = adminService.getLawyerApplications(status, search, pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<LawyerApplicationDto>>builder()
            .success(true)
            .message("Lawyer applications retrieved successfully")
            .data(applications)
            .build());
    }

    @PutMapping("/lawyer-applications/{applicationId}/approve")
    @Operation(summary = "Approve lawyer application")
    public ResponseEntity<ApiResponse<String>> approveLawyerApplication(
            @PathVariable Long applicationId,
            @RequestParam(required = false) String adminNotes) {
        
        adminService.approveLawyerApplication(applicationId, adminNotes);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("Lawyer application approved successfully")
            .data("Application approved and user role updated to lawyer")
            .build());
    }

    @PutMapping("/lawyer-applications/{applicationId}/reject")
    @Operation(summary = "Reject lawyer application")
    public ResponseEntity<ApiResponse<String>> rejectLawyerApplication(
            @PathVariable Long applicationId,
            @RequestParam(required = false) String adminNotes) {
        
        adminService.rejectLawyerApplication(applicationId, adminNotes);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("Lawyer application rejected successfully")
            .data("Application rejected with admin notes")
            .build());
    }

    // ========== CATEGORY MANAGEMENT ==========
    
    @GetMapping("/categories")
    @Operation(summary = "Get all categories for admin management")
    public ResponseEntity<ApiResponse<Page<PostCategoryDto>>> getAllCategoriesForAdmin(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(required = false) String search) {
        
        Sort sort = Sort.by(sortDir.equalsIgnoreCase("desc") ? 
            Sort.Direction.DESC : Sort.Direction.ASC, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<PostCategoryDto> categories = adminService.getAllCategoriesForAdmin(search, pageable);
        
        return ResponseEntity.ok(ApiResponse.<Page<PostCategoryDto>>builder()
            .success(true)
            .message("Categories retrieved successfully")
            .data(categories)
            .build());
    }

    @PostMapping("/categories")
    @Operation(summary = "Create a new category")
    public ResponseEntity<ApiResponse<PostCategoryDto>> createCategory(
            @RequestBody @Valid CategoryCreateDto categoryCreateDto) {
        
        log.info("Creating new category: {}", categoryCreateDto.getName());
        
        PostCategoryDto createdCategory = adminService.createCategory(categoryCreateDto);
        
        return ResponseEntity.ok(ApiResponse.<PostCategoryDto>builder()
            .success(true)
            .message("Category created successfully")
            .data(createdCategory)
            .build());
    }

    @PutMapping("/categories/{categoryId}")
    @Operation(summary = "Update an existing category")
    public ResponseEntity<ApiResponse<PostCategoryDto>> updateCategory(
            @PathVariable Long categoryId,
            @RequestBody @Valid CategoryUpdateDto categoryUpdateDto) {
        
        log.info("Updating category ID: {} with data: {}", categoryId, categoryUpdateDto.getName());
        
        PostCategoryDto updatedCategory = adminService.updateCategory(categoryId, categoryUpdateDto);
        
        return ResponseEntity.ok(ApiResponse.<PostCategoryDto>builder()
            .success(true)
            .message("Category updated successfully")
            .data(updatedCategory)
            .build());
    }

    @DeleteMapping("/categories/{categoryId}")
    @Operation(summary = "Delete a category")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Long categoryId) {
        
        log.info("Deleting category ID: {}", categoryId);
        
        adminService.deleteCategory(categoryId);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("Category deleted successfully")
            .data("Category and associated posts have been removed")
            .build());
    }

    @PutMapping("/categories/{categoryId}/status")
    @Operation(summary = "Toggle category active status")
    public ResponseEntity<ApiResponse<String>> toggleCategoryStatus(
            @PathVariable Long categoryId,
            @RequestParam Boolean isActive) {
        
        log.info("Toggling category ID: {} status to: {}", categoryId, isActive);
        
        adminService.updateCategoryStatus(categoryId, isActive);
        
        return ResponseEntity.ok(ApiResponse.<String>builder()
            .success(true)
            .message("Category status updated successfully")
            .data("Category " + (isActive ? "activated" : "deactivated"))
            .build());
    }

    // ========== ANALYTICS & REPORTS ==========

    @GetMapping("/analytics/user-growth")
    @Operation(summary = "Get user growth analytics")
    public ResponseEntity<ApiResponse<List<UserGrowthData>>> getUserGrowthReport(
            @RequestParam(defaultValue = "30days") String timeRange) {
        log.info("Getting user growth report for timeRange: {}", timeRange);
        
        try {
            List<UserGrowthData> data = analyticsService.getUserGrowthData(timeRange);
            return ResponseEntity.ok(ApiResponse.<List<UserGrowthData>>builder()
                .success(true)
                .message("User growth report generated successfully")
                .data(data)
                .build());
        } catch (Exception e) {
            log.error("Error generating user growth report", e);
            return ResponseEntity.ok(ApiResponse.<List<UserGrowthData>>builder()
                .success(false)
                .message("An unexpected error occurred")
                .data(null)
                .build());
        }
    }

    @GetMapping("/analytics/user-retention")
    @Operation(summary = "Get user retention analytics")
    public ResponseEntity<ApiResponse<List<UserRetentionData>>> getUserRetentionReport(
            @RequestParam(defaultValue = "30days") String timeRange) {
        log.info("Getting user retention report for timeRange: {}", timeRange);
        
        try {
            List<UserRetentionData> data = analyticsService.getUserRetentionData(timeRange);
            return ResponseEntity.ok(ApiResponse.<List<UserRetentionData>>builder()
                .success(true)
                .message("User retention report generated successfully")
                .data(data)
                .build());
        } catch (Exception e) {
            log.error("Error generating user retention report", e);
            return ResponseEntity.ok(ApiResponse.<List<UserRetentionData>>builder()
                .success(false)
                .message("An unexpected error occurred")
                .data(null)
                .build());
        }
    }

    @GetMapping("/analytics/content-stats")
    @Operation(summary = "Get content statistics")
    public ResponseEntity<ApiResponse<ContentStatsData>> getContentStatsReport(
            @RequestParam(defaultValue = "30days") String timeRange) {
        log.info("Getting content stats report for timeRange: {}", timeRange);
        
        try {
            ContentStatsData data = analyticsService.getContentStatsData(timeRange);
            return ResponseEntity.ok(ApiResponse.<ContentStatsData>builder()
                .success(true)
                .message("Content stats report generated successfully")
                .data(data)
                .build());
        } catch (Exception e) {
            log.error("Error generating content stats report", e);
            return ResponseEntity.ok(ApiResponse.<ContentStatsData>builder()
                .success(false)
                .message("An unexpected error occurred")
                .data(null)
                .build());
        }
    }

    @GetMapping("/analytics/engagement")
    @Operation(summary = "Get engagement analytics")
    public ResponseEntity<ApiResponse<List<EngagementData>>> getEngagementReport(
            @RequestParam(defaultValue = "30days") String timeRange) {
        log.info("Getting engagement report for timeRange: {}", timeRange);
        
        try {
            List<EngagementData> data = analyticsService.getEngagementData(timeRange);
            return ResponseEntity.ok(ApiResponse.<List<EngagementData>>builder()
                .success(true)
                .message("Engagement report generated successfully")
                .data(data)
                .build());
        } catch (Exception e) {
            log.error("Error generating engagement report", e);
            return ResponseEntity.ok(ApiResponse.<List<EngagementData>>builder()
                .success(false)
                .message("An unexpected error occurred")
                .data(null)
                .build());
        }
    }

    @GetMapping("/analytics/lawyer-performance")
    @Operation(summary = "Get lawyer performance metrics")
    public ResponseEntity<ApiResponse<List<LawyerPerformanceData>>> getLawyerPerformanceReport(
            @RequestParam(defaultValue = "30days") String timeRange) {
        log.info("Getting lawyer performance report for timeRange: {}", timeRange);
        
        try {
            List<LawyerPerformanceData> data = analyticsService.getLawyerPerformanceData(timeRange);
            return ResponseEntity.ok(ApiResponse.<List<LawyerPerformanceData>>builder()
                .success(true)
                .message("Lawyer performance report generated successfully")
                .data(data)
                .build());
        } catch (Exception e) {
            log.error("Error generating lawyer performance report", e);
            return ResponseEntity.ok(ApiResponse.<List<LawyerPerformanceData>>builder()
                .success(false)
                .message("An unexpected error occurred")
                .data(null)
                .build());
        }
    }

    @GetMapping("/analytics/category-distribution")
    @Operation(summary = "Get category distribution analytics")
    public ResponseEntity<ApiResponse<List<CategoryDistributionData>>> getCategoryDistributionReport(
            @RequestParam(defaultValue = "30days") String timeRange) {
        log.info("Getting category distribution report for timeRange: {}", timeRange);
        
        try {
            List<CategoryDistributionData> data = analyticsService.getCategoryDistributionData(timeRange);
            return ResponseEntity.ok(ApiResponse.<List<CategoryDistributionData>>builder()
                .success(true)
                .message("Category distribution report generated successfully")
                .data(data)
                .build());
        } catch (Exception e) {
            log.error("Error generating category distribution report", e);
            return ResponseEntity.ok(ApiResponse.<List<CategoryDistributionData>>builder()
                .success(false)
                .message("An unexpected error occurred")
                .data(null)
                .build());
        }
    }

    @GetMapping("/analytics/hourly-activity")
    @Operation(summary = "Get hourly activity patterns")
    public ResponseEntity<ApiResponse<List<HourlyActivityData>>> getHourlyActivityReport(
            @RequestParam(defaultValue = "30days") String timeRange) {
        log.info("Getting hourly activity report for timeRange: {}", timeRange);
        
        try {
            List<HourlyActivityData> data = analyticsService.getHourlyActivityData(timeRange);
            return ResponseEntity.ok(ApiResponse.<List<HourlyActivityData>>builder()
                .success(true)
                .message("Hourly activity report generated successfully")
                .data(data)
                .build());
        } catch (Exception e) {
            log.error("Error generating hourly activity report", e);
            return ResponseEntity.ok(ApiResponse.<List<HourlyActivityData>>builder()
                .success(false)
                .message("An unexpected error occurred")
                .data(null)
                .build());
        }
    }

    @GetMapping("/analytics/quality-metrics")
    @Operation(summary = "Get quality metrics")
    public ResponseEntity<ApiResponse<List<QualityMetricData>>> getQualityMetricsReport(
            @RequestParam(defaultValue = "30days") String timeRange) {
        log.info("Getting quality metrics report for timeRange: {}", timeRange);
        
        try {
            List<QualityMetricData> data = analyticsService.getQualityMetricsData(timeRange);
            return ResponseEntity.ok(ApiResponse.<List<QualityMetricData>>builder()
                .success(true)
                .message("Quality metrics report generated successfully")
                .data(data)
                .build());
        } catch (Exception e) {
            log.error("Error generating quality metrics report", e);
            return ResponseEntity.ok(ApiResponse.<List<QualityMetricData>>builder()
                .success(false)
                .message("An unexpected error occurred")
                .data(null)
                .build());
        }
    }

    @GetMapping("/analytics/{reportType}/export")
    @Operation(summary = "Export analytics report")
    public ResponseEntity<?> exportReport(
            @PathVariable String reportType,
            @RequestParam(defaultValue = "30days") String timeRange,
            @RequestParam(defaultValue = "pdf") String format) {
        log.info("Exporting {} report as {} for timeRange: {}", reportType, format, timeRange);
        
        try {
            byte[] reportBytes = analyticsService.exportReport(reportType, timeRange, format);
            
            String filename = String.format("%s-report-%s.%s", reportType, timeRange, format);
            String contentType = switch (format.toLowerCase()) {
                case "pdf" -> "application/pdf";
                case "excel" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                case "csv" -> "text/csv";
                default -> "application/octet-stream";
            };
            
            return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(reportBytes);
        } catch (UnsupportedOperationException e) {
            log.warn("Export functionality not yet implemented");
            return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(false)
                .message("Export functionality is not yet implemented")
                .data(null)
                .build());
        } catch (Exception e) {
            log.error("Error exporting report", e);
            return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(false)
                .message("An error occurred while exporting the report")
                .data(null)
                .build());
        }
    }
}