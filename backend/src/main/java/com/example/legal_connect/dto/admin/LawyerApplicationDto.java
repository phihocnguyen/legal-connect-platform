package com.example.legal_connect.dto.admin;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LawyerApplicationDto {
    private Long id;
    private UserSummaryDto user;
    private String licenseNumber;
    private String lawSchool;
    private Integer graduationYear;
    private List<String> specializations;
    private Integer yearsOfExperience;
    private String currentFirm;
    private String bio;
    private String phoneNumber;
    private String officeAddress;
    private List<String> documentUrls;
    private String status;
    private String adminNotes;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSummaryDto {
        private Long id;
        private String fullName;
        private String email;
        private String avatar;
    }
}