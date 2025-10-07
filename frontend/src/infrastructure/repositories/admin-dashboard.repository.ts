import { apiClient } from '../../lib/axiosInstance';

export interface AdminDashboardStats {
  // Basic counts
  totalUsers: number;
  totalPosts: number;
  totalLawyers: number;
  totalCategories: number;
  
  // Pending/Active items
  pendingApplications: number;
  activeUsers: number;
  reportedPosts: number;
  unresolvedReports: number;
  
  // Growth metrics
  newUsersThisMonth: number;
  newPostsThisMonth: number;
  newLawyersThisMonth: number;
  
  // User engagement
  totalMessages: number;
  totalConversations: number;
  
  // Recent activity
  recentActivities: RecentActivity[];
  
  // System info
  lastUpdated: string;
  
  // Popular content
  popularPosts: PopularContent[];
  
  // User statistics by role
  usersByRole: UserRoleStats[];
}

export interface RecentActivity {
  type: string;
  description: string;
  timestamp: string;
  userEmail: string;
  entityId: number;
}

export interface PopularContent {
  postId: number;
  title: string;
  categoryName: string;
  views: number;
  replies: number;
  createdAt: string;
}

export interface UserRoleStats {
  role: string;
  count: number;
  activeCount: number;
}

export class AdminDashboardRepository {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<AdminDashboardStats> {
    const response = await apiClient.get('/admin/dashboard/stats');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponse = response.data as any;
    
    if (apiResponse.success && apiResponse.data) {
      return apiResponse.data as AdminDashboardStats;
    }
    
    throw new Error(apiResponse.message || 'Failed to fetch dashboard statistics');
  }
}