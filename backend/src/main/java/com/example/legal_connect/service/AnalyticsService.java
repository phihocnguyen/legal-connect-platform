package com.example.legal_connect.service;

import com.example.legal_connect.dto.analytics.*;
import com.example.legal_connect.repository.ForumRepository;
import com.example.legal_connect.repository.UserRepository;
import com.example.legal_connect.repository.PostCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for admin analytics and reporting
 * Provides various analytics data for the admin dashboard
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ForumRepository forumRepository;
    private final PostCategoryRepository postCategoryRepository;
    private final com.example.legal_connect.repository.PostReplyRepository postReplyRepository;
    private final com.example.legal_connect.repository.PostVoteRepository postVoteRepository;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM dd");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MMM yyyy");

    /**
     * Get user growth data over specified time range
     */
    public List<UserGrowthData> getUserGrowthData(String timeRange) {
        log.info("Generating user growth report for timeRange: {}", timeRange);
        LocalDateTime startDate = getStartDateTime(timeRange);
        
        // Get user counts by role and date
        List<Object[]> usersByRole = userRepository.countUsersByRoleGroupedByDate(startDate);
        
        // Get post counts by date
        List<Object[]> postsByDate = forumRepository.countPostsGroupedByDate(startDate);
        
        // Create maps for easy lookup
        Map<String, Integer> usersCountMap = new HashMap<>();
        Map<String, Integer> lawyersCountMap = new HashMap<>();
        Map<String, Integer> postsCountMap = new HashMap<>();
        
        // Process user data by role
        for (Object[] row : usersByRole) {
            String date = row[0].toString();
            com.example.legal_connect.entity.User.Role role = (com.example.legal_connect.entity.User.Role) row[1];
            Long count = ((Number) row[2]).longValue();
            
            if (role == com.example.legal_connect.entity.User.Role.USER) {
                usersCountMap.put(date, count.intValue());
            } else if (role == com.example.legal_connect.entity.User.Role.LAWYER) {
                lawyersCountMap.put(date, count.intValue());
            }
        }
        
        // Process post data
        for (Object[] row : postsByDate) {
            String date = row[0].toString();
            Long count = ((Number) row[1]).longValue();
            postsCountMap.put(date, count.intValue());
        }
        
        // Build result list with all dates in range
        List<UserGrowthData> result = new ArrayList<>();
        LocalDateTime currentDate = startDate;
        LocalDateTime endDate = LocalDateTime.now();
        
        int previousTotal = 0;
        
        while (!currentDate.isAfter(endDate)) {
            String dateStr = currentDate.toLocalDate().toString();
            
            int users = usersCountMap.getOrDefault(dateStr, 0);
            int lawyers = lawyersCountMap.getOrDefault(dateStr, 0);
            int posts = postsCountMap.getOrDefault(dateStr, 0);
            
            int currentTotal = users + lawyers;
            double growth = 0.0;
            
            // Calculate growth percentage compared to previous period
            if (previousTotal > 0) {
                growth = ((currentTotal - previousTotal) * 100.0) / previousTotal;
            }
            
            result.add(UserGrowthData.builder()
                .period(currentDate.format(DATE_FORMATTER))
                .users(users)
                .lawyers(lawyers)
                .posts(posts)
                .growth(Math.round(growth * 100.0) / 100.0) // Round to 2 decimal places
                .build());
            
            previousTotal = currentTotal;
            currentDate = currentDate.plusDays(1);
        }
        
        return result;
    }

    /**
     * Get user retention data
     */
    public List<UserRetentionData> getUserRetentionData(String timeRange) {
        log.info("Generating user retention report for timeRange: {}", timeRange);
        int days = getNumberOfDays(timeRange);
        LocalDateTime startDate = getStartDateTime(timeRange);
        
        // TODO: Implement real database query
        // Example query to calculate retention:
        // WITH period_users AS (
        //   SELECT DISTINCT user_id, DATE(created_at) as period
        //   FROM user_activities
        //   WHERE created_at >= :startDate
        // ),
        // retained AS (
        //   SELECT 
        //     p1.period,
        //     COUNT(DISTINCT p1.user_id) as active,
        //     COUNT(DISTINCT p2.user_id) as retained
        //   FROM period_users p1
        //   LEFT JOIN period_users p2 ON p1.user_id = p2.user_id 
        //     AND p2.period = p1.period - INTERVAL 1 DAY
        //   GROUP BY p1.period
        // )
        // SELECT 
        //   period,
        //   retained,
        //   active,
        //   (retained * 100.0 / NULLIF(active, 0)) as rate
        // FROM retained
        
        List<UserRetentionData> result = new ArrayList<>();
        for (int i = 0; i < Math.min(days, 30); i++) {
            LocalDateTime date = startDate.plusDays(i);
            int active = 200 + (int)(Math.random() * 100);
            int retained = (int)(active * (0.7 + Math.random() * 0.25));
            result.add(UserRetentionData.builder()
                .period(date.format(DATE_FORMATTER))
                .retained(retained)
                .active(active)
                .rate((double)retained / active * 100)
                .build());
        }
        
        return result;
    }

    /**
     * Get overall content statistics
     */
    public ContentStatsData getContentStatsData(String timeRange) {
        log.info("Generating content stats report for timeRange: {}", timeRange);
        LocalDateTime startDate = getStartDateTime(timeRange);
        
        // Count total posts in time range
        long totalPosts = forumRepository.countByCreatedAtBetweenAndIsActiveTrue(startDate, LocalDateTime.now());
        
        // Count total replies in time range
        long totalReplies = postReplyRepository.countByCreatedAtAfterAndIsActiveTrue(startDate);
        
        // Calculate average replies per post
        Double avgReplies = postReplyRepository.getAverageReplyCountPerPost(startDate);
        double avgRepliesPerPost = (avgReplies != null) ? avgReplies : 0.0;
        
        // Get top categories by post count
        List<Object[]> categoryData = forumRepository.countPostsByCategoryGrouped(startDate);
        List<ContentStatsData.TopCategory> topCategories = new ArrayList<>();
        
        // Get top 5 categories by post count
        for (int i = 0; i < Math.min(categoryData.size(), 5); i++) {
            Object[] row = categoryData.get(i);
            String categoryName = (String) row[0];
            Long currentCount = ((Number) row[1]).longValue();
            
            // For growth calculation, we would need previous period data
            // For simplicity, we'll calculate a mock growth or leave it as 0
            double growth = 0.0;
            
            topCategories.add(ContentStatsData.TopCategory.builder()
                .name(categoryName)
                .posts(currentCount.intValue())
                .growth(growth)
                .build());
        }
        
        return ContentStatsData.builder()
            .totalPosts((int) totalPosts)
            .totalReplies((int) totalReplies)
            .avgRepliesPerPost(Math.round(avgRepliesPerPost * 100.0) / 100.0)
            .topCategories(topCategories)
            .build();
    }

    /**
     * Get engagement data (posts, replies, views, likes)
     */
    public List<EngagementData> getEngagementData(String timeRange) {
        log.info("Generating engagement report for timeRange: {}", timeRange);
        LocalDateTime startDate = getStartDateTime(timeRange);
        
        // Get posts by date
        List<Object[]> postsByDate = forumRepository.countPostsGroupedByDate(startDate);
        
        // Get replies by date
        List<Object[]> repliesByDate = postReplyRepository.countRepliesGroupedByDate(startDate);
        
        // Get views by date
        List<Object[]> viewsByDate = forumRepository.sumViewsGroupedByDate(startDate);
        
        // Get upvotes by date
        List<Object[]> votesByDate = postVoteRepository.countUpvotesGroupedByDate(startDate);
        
        // Create maps for easy lookup
        Map<String, Integer> postsMap = new HashMap<>();
        Map<String, Integer> repliesMap = new HashMap<>();
        Map<String, Integer> viewsMap = new HashMap<>();
        Map<String, Integer> likesMap = new HashMap<>();
        
        // Populate maps
        for (Object[] row : postsByDate) {
            String date = row[0].toString();
            int count = ((Number) row[1]).intValue();
            postsMap.put(date, count);
        }
        
        for (Object[] row : repliesByDate) {
            String date = row[0].toString();
            int count = ((Number) row[1]).intValue();
            repliesMap.put(date, count);
        }
        
        for (Object[] row : viewsByDate) {
            String date = row[0].toString();
            int count = row[1] != null ? ((Number) row[1]).intValue() : 0;
            viewsMap.put(date, count);
        }
        
        for (Object[] row : votesByDate) {
            String date = row[0].toString();
            int count = ((Number) row[1]).intValue();
            likesMap.put(date, count);
        }
        
        // Build result list
        List<EngagementData> result = new ArrayList<>();
        LocalDateTime currentDate = startDate;
        LocalDateTime endDate = LocalDateTime.now();
        
        while (!currentDate.isAfter(endDate)) {
            String dateStr = currentDate.toLocalDate().toString();
            
            result.add(EngagementData.builder()
                .period(currentDate.format(DATE_FORMATTER))
                .posts(postsMap.getOrDefault(dateStr, 0))
                .replies(repliesMap.getOrDefault(dateStr, 0))
                .views(viewsMap.getOrDefault(dateStr, 0))
                .likes(likesMap.getOrDefault(dateStr, 0))
                .build());
            
            currentDate = currentDate.plusDays(1);
        }
        
        return result;
    }

    /**
     * Get lawyer performance metrics
     */
    public List<LawyerPerformanceData> getLawyerPerformanceData(String timeRange) {
        log.info("Generating lawyer performance report for timeRange: {}", timeRange);
        LocalDateTime startDate = getStartDateTime(timeRange);
        
        // TODO: Implement real database query
        // Example query:
        // SELECT 
        //   u.full_name as name,
        //   COUNT(pr.id) as responses,
        //   AVG(TIMESTAMPDIFF(HOUR, p.created_at, pr.created_at)) as avg_response_time,
        //   AVG(pr.rating) as satisfaction,
        //   COUNT(DISTINCT c.id) as active_clients
        // FROM users u
        // JOIN post_replies pr ON pr.user_id = u.id
        // JOIN posts p ON p.id = pr.post_id
        // LEFT JOIN conversations c ON c.lawyer_id = u.id AND c.status = 'ACTIVE'
        // WHERE u.role = 'LAWYER' AND pr.created_at >= :startDate
        // GROUP BY u.id
        // ORDER BY responses DESC
        // LIMIT 10
        
        return List.of(
            LawyerPerformanceData.builder()
                .name("Luật sư Nguyễn Văn A").responses(145).avgResponseTime(2.5)
                .satisfaction(4.7).activeClients(23).build(),
            LawyerPerformanceData.builder()
                .name("Luật sư Trần Thị B").responses(132).avgResponseTime(3.2)
                .satisfaction(4.5).activeClients(19).build(),
            LawyerPerformanceData.builder()
                .name("Luật sư Lê Văn C").responses(118).avgResponseTime(2.8)
                .satisfaction(4.6).activeClients(21).build(),
            LawyerPerformanceData.builder()
                .name("Luật sư Phạm Thị D").responses(105).avgResponseTime(3.5)
                .satisfaction(4.4).activeClients(17).build()
        );
    }

    /**
     * Get category distribution data
     */
    public List<CategoryDistributionData> getCategoryDistributionData(String timeRange) {
        log.info("Generating category distribution report for timeRange: {}", timeRange);
        LocalDateTime startDate = getStartDateTime(timeRange);
        
        // Get posts grouped by category
        List<Object[]> categoryData = forumRepository.countPostsByCategoryGrouped(startDate);
        
        List<CategoryDistributionData> result = new ArrayList<>();
        
        for (Object[] row : categoryData) {
            String categoryName = (String) row[0];
            Long postCount = ((Number) row[1]).longValue();
            
            // Note: Counting lawyers per category would require a complex query
            // joining users who posted in each category. For simplicity, we'll
            // set it to 0 or implement later if needed by the frontend
            int lawyers = 0;
            
            result.add(CategoryDistributionData.builder()
                .name(categoryName)
                .value(postCount.intValue())
                .posts(postCount.intValue())
                .lawyers(lawyers)
                .build());
        }
        
        return result;
    }

    /**
     * Get hourly activity patterns
     */
    public List<HourlyActivityData> getHourlyActivityData(String timeRange) {
        log.info("Generating hourly activity report for timeRange: {}", timeRange);
        LocalDateTime startDate = getStartDateTime(timeRange);
        
        // Get posts by hour
        List<Object[]> postsByHour = forumRepository.countPostsGroupedByHour(startDate);
        
        // Get replies by hour
        List<Object[]> repliesByHour = postReplyRepository.countRepliesGroupedByHour(startDate);
        
        // Create map for aggregation
        Map<Integer, Integer> activityMap = new HashMap<>();
        
        // Initialize all hours with 0
        for (int i = 0; i < 24; i++) {
            activityMap.put(i, 0);
        }
        
        // Add posts counts
        for (Object[] row : postsByHour) {
            int hour = ((Number) row[0]).intValue();
            int count = ((Number) row[1]).intValue();
            activityMap.put(hour, activityMap.get(hour) + count);
        }
        
        // Add replies counts
        for (Object[] row : repliesByHour) {
            int hour = ((Number) row[0]).intValue();
            int count = ((Number) row[1]).intValue();
            activityMap.put(hour, activityMap.get(hour) + count);
        }
        
        // Build result list
        List<HourlyActivityData> result = new ArrayList<>();
        for (int hour = 0; hour < 24; hour++) {
            result.add(HourlyActivityData.builder()
                .hour(hour)
                .activity(activityMap.get(hour))
                .build());
        }
        
        return result;
    }

    /**
     * Get quality metrics data
     */
    public List<QualityMetricData> getQualityMetricsData(String timeRange) {
        log.info("Generating quality metrics report for timeRange: {}", timeRange);
        
        // TODO: Implement real quality scoring algorithm
        // This could involve analyzing:
        // - Average response times
        // - User satisfaction ratings
        // - Post/reply quality (length, formatting, helpfulness votes)
        // - Expert verification status
        
        return List.of(
            QualityMetricData.builder().category("Chất lượng phản hồi").score(85.5).build(),
            QualityMetricData.builder().category("Độ hữu ích").score(78.3).build(),
            QualityMetricData.builder().category("Độ hài lòng").score(82.1).build(),
            QualityMetricData.builder().category("Tính chuyên nghiệp").score(88.7).build(),
            QualityMetricData.builder().category("Thời gian phản hồi").score(75.4).build()
        );
    }

    /**
     * Export report in specified format (PDF, Excel, CSV)
     */
    public byte[] exportReport(String reportType, String timeRange, String format) {
        log.info("Exporting {} report as {} for timeRange: {}", reportType, format, timeRange);
        
        // TODO: Implement export functionality using:
        // - PDF: iText or Apache PDFBox
        // - Excel: Apache POI
        // - CSV: Native Java or OpenCSV
        
        throw new UnsupportedOperationException("Export functionality not yet implemented");
    }

    // Helper methods
    
    /**
     * Convert time range string to number of days
     */
    private int getNumberOfDays(String timeRange) {
        return switch (timeRange) {
            case "7days" -> 7;
            case "30days" -> 30;
            case "90days" -> 90;
            case "1year" -> 365;
            case "all" -> 3650; // 10 years
            default -> 30;
        };
    }

    /**
     * Get start date/time for the specified time range
     */
    private LocalDateTime getStartDateTime(String timeRange) {
        int days = getNumberOfDays(timeRange);
        return LocalDateTime.now().minusDays(days);
    }
}
