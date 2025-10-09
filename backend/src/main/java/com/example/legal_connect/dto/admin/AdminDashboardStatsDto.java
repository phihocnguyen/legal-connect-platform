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
public class AdminDashboardStatsDto {

    // Basic counts
    private long totalUsers;
    private long totalPosts;
    private long totalLawyers;
    private long totalCategories;
    
    // Pending/Active items
    private long pendingApplications;
    private long activeUsers; // users active in last 30 days
    private long reportedPosts;
    private long unresolvedReports;
    
    // Growth metrics (compared to last period)
    private long newUsersThisMonth;
    private long newPostsThisMonth;
    private long newLawyersThisMonth;
    
    // User engagement
    private long totalMessages;
    private long totalConversations;
    
    // Recent activity
    private List<RecentActivityDto> recentActivities;
    
    // System info
    private LocalDateTime lastUpdated;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityDto {
        private String type; // USER_REGISTERED, POST_CREATED, LAWYER_APPLIED, etc.
        private String description;
        private LocalDateTime timestamp;
        private String userEmail;
        private Long entityId;
    }
    
    // Popular content
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PopularContentDto {
        private Long postId;
        private String title;
        private String categoryName;
        private int views;
        private int replies;
        private LocalDateTime createdAt;
    }
    
    private List<PopularContentDto> popularPosts;
    
    // User statistics by role
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserRoleStatsDto {
        private String role;
        private long count;
        private long activeCount; // active in last 30 days
    }
    
    private List<UserRoleStatsDto> usersByRole;
    
    // Chart data
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyGrowthDto {
        private String month; // "2024-01", "2024-02", etc.
        private long users;
        private long lawyers;
        private long posts;
    }
    
    private List<MonthlyGrowthDto> monthlyGrowth;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeeklyActivityDto {
        private String day; // "Monday", "Tuesday", etc.
        private long posts;
        private long replies;
        private long views;
    }
    
    private List<WeeklyActivityDto> weeklyActivity;
}