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
    skipLoading?: boolean;
  }) => Promise<{
    content: ViolationPostDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }>;
  
  updatePostStatus: (id: number, isActive: boolean) => Promise<void>;
  getViolationReplies: (params?: {
    page?: number;
    size?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    skipLoading?: boolean;
  }) => Promise<{
    content: ViolationPostDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }>;
  updateReplyStatus: (id: number, isActive: boolean) => Promise<void>;
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
    skipLoading?: boolean;
  }) => {
    try {
      if (!params?.skipLoading) setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

      const response = await apiClient.get(`/admin/violations?${queryParams.toString()}`);

      const apiResponse = response.data as any;
      
      if (apiResponse.success && apiResponse.data) {
        return {
          content: apiResponse.data.content as ViolationPostDto[],
          totalPages: apiResponse.data.totalPages,
          totalElements: apiResponse.data.totalElements,
          size: apiResponse.data.size,
          number: apiResponse.data.number,
        };
      }
      
      throw new Error(apiResponse.message || 'Failed to fetch violation posts');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      if (!params?.skipLoading) setLoading(false);
    }
  }, []);

  const updatePostStatus = useCallback(async (id: number, isActive: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/admin/posts/${id}/status?isActive=${isActive}`);

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

  const getViolationReplies = useCallback(async (params?: {
    page?: number;
    size?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    skipLoading?: boolean;
  }) => {
    try {
      if (!params?.skipLoading) setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (params?.page !== undefined) queryParams.append('page', params.page.toString());
      if (params?.size !== undefined) queryParams.append('size', params.size.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

      const response = await apiClient.get(`/admin/violations/replies?${queryParams.toString()}`);

      const apiResponse = response.data as any;
      
      if (apiResponse.success && apiResponse.data) {
        return {
          content: apiResponse.data.content as ViolationPostDto[],
          totalPages: apiResponse.data.totalPages,
          totalElements: apiResponse.data.totalElements,
          size: apiResponse.data.size,
          number: apiResponse.data.number,
        };
      }
      
      throw new Error(apiResponse.message || 'Failed to fetch violation replies');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      if (!params?.skipLoading) setLoading(false);
    }
  }, []);

  const updateReplyStatus = useCallback(async (id: number, isActive: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/admin/replies/${id}/status?isActive=${isActive}`);

      const apiResponse = response.data as any;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to update reply status');
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
    getViolationReplies,
    updateReplyStatus,
  };
}