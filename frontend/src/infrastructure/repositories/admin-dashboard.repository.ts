import { apiClient } from '../../lib/axiosInstance';
import { AdminDashboardStats } from '../../domain/entities';

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