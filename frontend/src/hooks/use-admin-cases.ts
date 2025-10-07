import { useState, useCallback } from 'react';
import { container } from '@/infrastructure/container';
import { AdminRepository } from '@/domain/interfaces/repositories';
import { LawyerApplication, AdminUser, AdminPost } from '@/domain/entities';
import { toast } from 'sonner';

interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export function useAdminCases() {
  const [loading, setLoading] = useState(false);
  const adminRepository = container.getRepository<AdminRepository>('AdminRepository');

  const getUsers = useCallback(async (params: {
    page?: number;
    size?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PagedResponse<AdminUser> | null> => {
    try {
      setLoading(true);
      return await adminRepository.getUsers(params);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Có lỗi khi tải danh sách người dùng');
      return null;
    } finally {
      setLoading(false);
    }
  }, [adminRepository]);

  const updateUserStatus = useCallback(async (userId: number, isEnabled: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      await adminRepository.updateUserStatus(userId, isEnabled);
      toast.success(`Đã ${isEnabled ? 'kích hoạt' : 'vô hiệu hóa'} người dùng thành công`);
      return true;
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Có lỗi khi cập nhật trạng thái người dùng');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminRepository]);

  // Posts Management
  const getPosts = useCallback(async (params: {
    page?: number;
    size?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PagedResponse<AdminPost> | null> => {
    try {
      setLoading(true);
      return await adminRepository.getPosts(params);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Có lỗi khi tải danh sách bài viết');
      return null;
    } finally {
      setLoading(false);
    }
  }, [adminRepository]);

  const updatePostStatus = useCallback(async (postId: number, isActive: boolean): Promise<boolean> => {
    try {
      setLoading(true);
      await adminRepository.updatePostStatus(postId, isActive);
      toast.success('Đã cập nhật trạng thái bài viết thành công');
      return true;
    } catch (error) {
      console.error('Error updating post status:', error);
      toast.error('Có lỗi khi cập nhật trạng thái bài viết');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminRepository]);

  // Lawyer Applications Management
  const getLawyerApplications = useCallback(async (params: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PagedResponse<LawyerApplication> | null> => {
    try {
      setLoading(true);
      return await adminRepository.getLawyerApplications(params);
    } catch (error) {
      console.error('Error fetching lawyer applications:', error);
      toast.error('Có lỗi khi tải danh sách đơn đăng ký luật sư');
      return null;
    } finally {
      setLoading(false);
    }
  }, [adminRepository]);

  const approveLawyerApplication = useCallback(async (applicationId: number, adminNotes?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminRepository.approveLawyerApplication(applicationId, adminNotes);
      toast.success('Đã phê duyệt đơn đăng ký luật sư thành công');
      return true;
    } catch (error) {
      console.error('Error approving lawyer application:', error);
      toast.error('Có lỗi khi phê duyệt đơn đăng ký');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminRepository]);

  const rejectLawyerApplication = useCallback(async (applicationId: number, adminNotes?: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminRepository.rejectLawyerApplication(applicationId, adminNotes);
      toast.success('Đã từ chối đơn đăng ký luật sư');
      return true;
    } catch (error) {
      console.error('Error rejecting lawyer application:', error);
      toast.error('Có lỗi khi từ chối đơn đăng ký');
      return false;
    } finally {
      setLoading(false);
    }
  }, [adminRepository]);

  // Dashboard Stats
  const getDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      return await adminRepository.getDashboardStats();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Có lỗi khi tải thống kê dashboard');
      return null;
    } finally {
      setLoading(false);
    }
  }, [adminRepository]);

  return {
    loading,
    // Users
    getUsers,
    updateUserStatus,
    // Posts
    getPosts,
    updatePostStatus,
    // Lawyer Applications
    getLawyerApplications,
    approveLawyerApplication,
    rejectLawyerApplication,
    // Dashboard
    getDashboardStats,
  };
}