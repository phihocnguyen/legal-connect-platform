package com.example.legal_connect.controller;

import com.example.legal_connect.dto.lawyer.LawyerApplicationRequest;
import com.example.legal_connect.dto.admin.LawyerApplicationDto;
import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.service.LawyerApplicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/lawyer")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Lawyer Application", description = "Lawyer application management APIs")
public class LawyerController {

    private final LawyerApplicationService lawyerApplicationService;

    @PostMapping("/apply")
    @Operation(summary = "Submit lawyer application")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<LawyerApplicationDto>> submitApplication(
            @Valid @RequestBody LawyerApplicationRequest request) {
        
        try {
            log.info("Received lawyer application request - Bio length: {}, Bio content: '{}'", 
                request.getBio() != null ? request.getBio().length() : 0, 
                request.getBio() != null ? request.getBio().substring(0, Math.min(50, request.getBio().length())) : "null");
            
            LawyerApplicationDto application = lawyerApplicationService.submitApplication(request);
            
            return ResponseEntity.ok(ApiResponse.<LawyerApplicationDto>builder()
                .success(true)
                .message("Lawyer application submitted successfully")
                .data(application)
                .build());
                
        } catch (RuntimeException e) {
            log.error("Error submitting lawyer application", e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<LawyerApplicationDto>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @GetMapping("/application")
    @Operation(summary = "Get current user's lawyer application")
    @PreAuthorize("hasRole('USER') or hasRole('LAWYER')")
    public ResponseEntity<ApiResponse<LawyerApplicationDto>> getUserApplication() {
        
        Optional<LawyerApplicationDto> application = lawyerApplicationService.getUserApplication();
        
        if (application.isPresent()) {
            return ResponseEntity.ok(ApiResponse.<LawyerApplicationDto>builder()
                .success(true)
                .message("Application retrieved successfully")
                .data(application.get())
                .build());
        } else {
            return ResponseEntity.ok(ApiResponse.<LawyerApplicationDto>builder()
                .success(false)
                .message("No application found")
                .build());
        }
    }

    @GetMapping("/can-apply")
    @Operation(summary = "Check if current user can apply to become a lawyer")
    @PreAuthorize("hasRole('USER') or hasRole('LAWYER')")
    public ResponseEntity<ApiResponse<Boolean>> canUserApply() {
        
        boolean canApply = lawyerApplicationService.canUserApply();
        
        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
            .success(true)
            .message(canApply ? "User can apply" : "User cannot apply")
            .data(canApply)
            .build());
    }

    @GetMapping("/has-applied")
    @Operation(summary = "Check if current user has already applied")
    @PreAuthorize("hasRole('USER') or hasRole('LAWYER')")
    public ResponseEntity<ApiResponse<Boolean>> hasUserApplied() {
        
        boolean hasApplied = lawyerApplicationService.hasUserApplied();
        
        return ResponseEntity.ok(ApiResponse.<Boolean>builder()
            .success(true)
            .message(hasApplied ? "User has applied" : "User has not applied")
            .data(hasApplied)
            .build());
    }

    @PutMapping("/application/{applicationId}/documents")
    @Operation(summary = "Update documents for lawyer application")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<LawyerApplicationDto>> updateApplicationDocuments(
            @PathVariable Long applicationId,
            @RequestBody List<String> documentUrls) {
        
        try {
            LawyerApplicationDto updatedApplication = lawyerApplicationService.updateApplicationDocuments(applicationId, documentUrls);
            
            return ResponseEntity.ok(ApiResponse.<LawyerApplicationDto>builder()
                .success(true)
                .message("Application documents updated successfully")
                .data(updatedApplication)
                .build());
                
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.<LawyerApplicationDto>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }

    @DeleteMapping("/application/{applicationId}")
    @Operation(summary = "Delete lawyer application")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse<String>> deleteApplication(@PathVariable Long applicationId) {
        
        try {
            lawyerApplicationService.deleteApplication(applicationId);
            
            return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Application deleted successfully")
                .data("Application and associated documents have been removed")
                .build());
                
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.<String>builder()
                    .success(false)
                    .message(e.getMessage())
                    .build());
        }
    }
}