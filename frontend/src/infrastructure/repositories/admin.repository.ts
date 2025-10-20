import { AdminRepository } from '../../domain/interfaces/repositories';
import { AdminUser, LawyerApplication, AdminDashboardStats, AdminPost } from '../../domain/entities';
import { apiClient } from '../../lib/axiosInstance';

export class HttpAdminRepository implements AdminRepository {
  
  /**
   * Get all users for admin management
   */
  async getUsers(params: {
    page?: number;
    size?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<{
    content: AdminUser[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.role) queryParams.append('role', params.role);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);

    const response = await apiClient.get(`/admin/users?${queryParams.toString()}`);
    
    // The backend returns ApiResponse<Page<UserManagementDto>>
    // We need to extract the data.content which contains UserManagementDto[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponse = response.data as any;
    
    if (apiResponse.success && apiResponse.data) {
      return {
        content: apiResponse.data.content as AdminUser[],
        totalPages: apiResponse.data.page.totalPages,
        totalElements: apiResponse.data.page.totalElements,
        size: apiResponse.data.page.size,
        number: apiResponse.data.page.number,
      };
    }
    
    throw new Error(apiResponse.message || 'Failed to fetch users');
  }

  /**
   * Get posts for moderation
   */
  async getPosts(params: {
    page?: number;
    size?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortDir?: string;
  }): Promise<{
    content: AdminPost[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);

    const response = await apiClient.get(`/admin/posts?${queryParams.toString()}`);
    
    // The backend returns ApiResponse<Page<PostModerationDto>>
    // We need to extract the data.content which contains PostModerationDto[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponse = response.data as any;
    
    if (apiResponse.success && apiResponse.data) {
      return {
        content: apiResponse.data.content as AdminPost[],
        totalPages: apiResponse.data.page.totalPages,
        totalElements: apiResponse.data.page.totalElements,
        size: apiResponse.data.page.size,
        number: apiResponse.data.page.number,
      };
    }
    
    throw new Error(apiResponse.message || 'Failed to fetch posts');
  }

  /**
   * Get lawyer applications for admin review
   */
  async getLawyerApplications(params: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<{
    content: LawyerApplication[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }> {
    const queryParams = new URLSearchParams();
    
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.status) queryParams.append('status', params.status);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortDir) queryParams.append('sortDir', params.sortDir);

    const response = await apiClient.get(`/admin/lawyer-applications?${queryParams.toString()}`);
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const apiResponse = response.data as any;
    
    if (apiResponse.success && apiResponse.data) {
      return {
        content: apiResponse.data.content as LawyerApplication[],
        totalPages: apiResponse.data.page.totalPages,
        totalElements: apiResponse.data.page.totalElements,
        size: apiResponse.data.page.size,
        number: apiResponse.data.page.number,
      };
    }
    
    throw new Error(apiResponse.message || 'Failed to fetch lawyer applications');
  }

  /**
   * Get admin dashboard statistics
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

  /**
   * Update user enabled/disabled status
   */
  async updateUserStatus(userId: number, isEnabled: boolean): Promise<void> {
    await apiClient.put(`/admin/users/${userId}/status?isEnabled=${isEnabled}`);
  }

  /**
   * Update post active/inactive status
   */
  async updatePostStatus(postId: number, isActive: boolean): Promise<void> {
    await apiClient.put(`/admin/posts/${postId}/status?isActive=${isActive}`);
  }

  /**
   * Reject lawyer application
   */
  async rejectLawyerApplication(applicationId: number, adminNotes?: string): Promise<void> {
    const params = new URLSearchParams();
    if (adminNotes) {
      params.append('adminNotes', adminNotes);
    }
    
    await apiClient.put(`/admin/lawyer-applications/${applicationId}/reject?${params.toString()}`);
  }

  /**
   * Approve lawyer application
   */
  async approveLawyerApplication(applicationId: number, adminNotes?: string): Promise<void> {
    const params = new URLSearchParams();
    if (adminNotes) {
      params.append('adminNotes', adminNotes);
    }
    
    await apiClient.put(`/admin/lawyer-applications/${applicationId}/approve?${params.toString()}`);
  }
}