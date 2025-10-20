import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/axiosInstance';

export interface ViolationPostDto {
  id: number;
  title: string;
  content: string;
  categoryName: string;
  author: {
    id: number;
    fullName: string;
    email: string;
    avatar?: string;
    role: string;
  };
  views: number;
  replyCount: number;
  isActive: boolean;
  isPinned: boolean;
  isHot: boolean;
  createdAt: string;
  updatedAt: string;
  violationReason?: string; // Admin's note
  reportReasons?: string[]; // User report reasons
  isReported: boolean;
  reportCount: number;
}

interface UseAdminViolationsReturn {
  loading: boolean;
  error: string | null;
  getViolationPosts: (params?: {
    page?: number;
    size?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) => Promise<{
    content: ViolationPostDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }>;
  
  updatePostStatus: (id: number, isActive: boolean) => Promise<void>;
}

export function useAdminViolations(): UseAdminViolationsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getViolationPosts = useCallback(async (params?: {
    page?: number;
    size?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

      const response = await apiClient.get(`/admin/violations?${queryParams.toString()}`);

      // The backend returns ApiResponse<Page<PostModerationDto>>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (apiResponse.success && apiResponse.data) {
        return {
          content: apiResponse.data.content as ViolationPostDto[],
          totalPages: apiResponse.data.page.totalPages,
          totalElements: apiResponse.data.page.totalElements,
          size: apiResponse.data.page.size,
          number: apiResponse.data.page.number,
        };
      }
      
      throw new Error(apiResponse.message || 'Failed to fetch violation posts');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePostStatus = useCallback(async (id: number, isActive: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/admin/posts/${id}/status?isActive=${isActive}`);

      // The backend returns ApiResponse<String>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to update post status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getViolationPosts,
    updatePostStatus,
  };
}