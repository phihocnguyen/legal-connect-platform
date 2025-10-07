package com.example.legal_connect.service;

import com.example.legal_connect.dto.lawyer.LawyerApplicationRequest;
import com.example.legal_connect.dto.admin.LawyerApplicationDto;
import com.example.legal_connect.entity.LawyerApplication;
import com.example.legal_connect.entity.User;
import com.example.legal_connect.repository.LawyerApplicationRepository;
import com.example.legal_connect.repository.UserRepository;
import com.example.legal_connect.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class LawyerApplicationService {

    private final LawyerApplicationRepository lawyerApplicationRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;

    @Transactional
    public LawyerApplicationDto submitApplication(LawyerApplicationRequest request) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
            
            User user = userRepository.findByEmail(userPrincipal.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

            if (lawyerApplicationRepository.existsByUser(user)) {
                throw new RuntimeException("You have already submitted a lawyer application");
            }
            if (user.getRole() == User.Role.LAWYER) {
                throw new RuntimeException("You are already a lawyer");
            }
            String specializationsStr = String.join(",", request.getSpecializations());

            log.info("Creating lawyer application with {} document URLs: {}", 
                request.getDocumentUrls().size(), request.getDocumentUrls());
            log.info("Bio field - length: {}, content preview: '{}'", 
                request.getBio() != null ? request.getBio().length() : 0,
                request.getBio() != null ? request.getBio().substring(0, Math.min(100, request.getBio().length())) : "null");

            LawyerApplication application = LawyerApplication.builder()
                .user(user)
                .licenseNumber(request.getLicenseNumber())
                .lawSchool(request.getLawSchool())
                .graduationYear(request.getGraduationYear())
                .specializations(specializationsStr)
                .yearsOfExperience(request.getYearsOfExperience())
                .currentFirm(request.getCurrentFirm())
                .bio(request.getBio())
                .phoneNumber(request.getPhoneNumber())
                .officeAddress(request.getOfficeAddress())
                .status(LawyerApplication.ApplicationStatus.PENDING)
                .build();

            // Set document URLs using the setter method
            application.setDocumentUrls(request.getDocumentUrls());

            LawyerApplication savedApplication = lawyerApplicationRepository.save(application);
            
            log.info("Saved application - Bio in entity: '{}'", 
                savedApplication.getBio() != null ? savedApplication.getBio().substring(0, Math.min(100, savedApplication.getBio().length())) : "null");
            log.info("Lawyer application submitted by user: {}", user.getEmail());
            
            return convertToDto(savedApplication);
        } catch (Exception e) {
            log.error("Error saving lawyer application: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to save lawyer application: " + e.getMessage());
        }
    }

    public Optional<LawyerApplicationDto> getUserApplication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        
        User user = userRepository.findByEmail(userPrincipal.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        return lawyerApplicationRepository.findByUser(user)
            .map(this::convertToDto);
    }

    public boolean hasUserApplied() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        
        User user = userRepository.findByEmail(userPrincipal.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        return lawyerApplicationRepository.existsByUser(user);
    }

    public boolean canUserApply() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        
        User user = userRepository.findByEmail(userPrincipal.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        boolean hasApplication = lawyerApplicationRepository.existsByUser(user);
        User.Role currentRole = user.getRole();
        
        log.info("User {} canApply check: role={}, hasApplication={}", 
                user.getEmail(), currentRole, hasApplication);

        // User can apply if they are not already a lawyer and haven't submitted an application
        boolean canApply = currentRole != User.Role.LAWYER && !hasApplication;
        log.info("Final canApply result: {}", canApply);
        
        return canApply;
    }

    @Transactional
    public LawyerApplicationDto updateApplicationDocuments(Long applicationId, java.util.List<String> newDocumentUrls) {
        // Get current user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        
        User user = userRepository.findByEmail(userPrincipal.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the application
        LawyerApplication application = lawyerApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        // Verify ownership
        if (!application.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only update your own application");
        }

        // Clean up old documents from Cloudinary if they exist
        if (application.getDocumentUrls() != null && !application.getDocumentUrls().isEmpty()) {
            for (String oldUrl : application.getDocumentUrls()) {
                String publicId = cloudinaryService.extractPublicId(oldUrl);
                if (publicId != null) {
                    cloudinaryService.deleteFile(publicId);
                }
            }
        }

        // Update with new document URLs
        application.setDocumentUrls(newDocumentUrls);
        LawyerApplication savedApplication = lawyerApplicationRepository.save(application);
        
        log.info("Application documents updated for user: {}", user.getEmail());
        
        return convertToDto(savedApplication);
    }

    public void deleteApplication(Long applicationId) {
        // Get current user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal userPrincipal = (UserPrincipal) auth.getPrincipal();
        
        User user = userRepository.findByEmail(userPrincipal.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Find the application
        LawyerApplication application = lawyerApplicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        // Verify ownership
        if (!application.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You can only delete your own application");
        }

        // Clean up documents from Cloudinary
        if (application.getDocumentUrls() != null && !application.getDocumentUrls().isEmpty()) {
            for (String url : application.getDocumentUrls()) {
                String publicId = cloudinaryService.extractPublicId(url);
                if (publicId != null) {
                    cloudinaryService.deleteFile(publicId);
                }
            }
        }

        lawyerApplicationRepository.delete(application);
        log.info("Application deleted for user: {}", user.getEmail());
    }

    private LawyerApplicationDto convertToDto(LawyerApplication application) {
        LawyerApplicationDto.UserSummaryDto userDto = LawyerApplicationDto.UserSummaryDto.builder()
            .id(application.getUser().getId())
            .fullName(application.getUser().getFullName())
            .email(application.getUser().getEmail())
            .avatar(application.getUser().getAvatar())
            .build();

        return LawyerApplicationDto.builder()
            .id(application.getId())
            .user(userDto)
            .licenseNumber(application.getLicenseNumber())
            .lawSchool(application.getLawSchool())
            .graduationYear(application.getGraduationYear())
            .specializations(application.getSpecializations() != null ? 
                Arrays.asList(application.getSpecializations().split(",")) : null)
            .yearsOfExperience(application.getYearsOfExperience())
            .currentFirm(application.getCurrentFirm())
            .bio(application.getBio())
            .phoneNumber(application.getPhoneNumber())
            .officeAddress(application.getOfficeAddress())
            .documentUrls(application.getDocumentUrls())
            .status(application.getStatus().toString())
            .adminNotes(application.getAdminNotes())
            .reviewedBy(application.getReviewedBy())
            .reviewedAt(application.getReviewedAt())
            .createdAt(application.getCreatedAt())
            .build();
    }
}