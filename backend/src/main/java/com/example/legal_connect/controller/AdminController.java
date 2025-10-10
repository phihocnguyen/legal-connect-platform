package com.example.legal_connect.controller;

import com.example.legal_connect.dto.admin.UserManagementDto;
import com.example.legal_connect.dto.admin.PostModerationDto;
import com.example.legal_connect.dto.admin.LawyerApplicationDto;
import com.example.legal_connect.dto.admin.AdminDashboardStatsDto;
import com.example.legal_connect.dto.admin.CategoryCreateDto;
import com.example.legal_connect.dto.admin.CategoryUpdateDto;
import com.example.legal_connect.dto.forum.PostCategoryDto;
import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Admin Management", description = "Admin dashboard management APIs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

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

    // ========== LAWYER APPLICATIONS ==========
    
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
}