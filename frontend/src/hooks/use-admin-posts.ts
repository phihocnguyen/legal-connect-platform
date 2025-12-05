import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/axiosInstance';

export interface PostModerationDto {
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
  reason?: string;
  isReported: boolean;
  reportCount: number;
}

interface UseAdminPostsReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  getAllPosts: (params?: {
    page?: number;
    size?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) => Promise<{
    content: PostModerationDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }>;
  
  getPostDetails: (id: number) => Promise<PostModerationDto>;
  updatePostStatus: (id: number, isActive: boolean) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  updatePostPinStatus: (id: number, isPinned: boolean) => Promise<void>;
  updatePostHotStatus: (id: number, isHot: boolean) => Promise<void>;
}

export function useAdminPosts(): UseAdminPostsReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllPosts = useCallback(async (params?: {
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

      const response = await apiClient.get(`/admin/posts?${queryParams.toString()}`);

      // The backend returns ApiResponse<Page<PostModerationDto>>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (apiResponse.success && apiResponse.data) {
        return {
          content: apiResponse.data.content as PostModerationDto[],
          totalPages: apiResponse.data.page.totalPages,
          totalElements: apiResponse.data.page.totalElements,
          size: apiResponse.data.page.size,
          number: apiResponse.data.page.number,
        };
      }
      
      throw new Error(apiResponse.message || 'Failed to fetch posts');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostDetails = useCallback(async (id: number): Promise<PostModerationDto> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/admin/posts/${id}`);

      // The backend returns ApiResponse<PostModerationDto>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data as PostModerationDto;
      }
      
      throw new Error(apiResponse.message || 'Failed to fetch post details');
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

  const deletePost = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.delete(`/admin/posts/${id}`);

      // The backend returns ApiResponse<String>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to delete post');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePostPinStatus = useCallback(async (id: number, isPinned: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/admin/posts/${id}/pin?isPinned=${isPinned}`);

      // The backend returns ApiResponse<String>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to update post pin status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePostHotStatus = useCallback(async (id: number, isHot: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/admin/posts/${id}/hot?isHot=${isHot}`);

      // The backend returns ApiResponse<String>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to update post hot status');
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
    getAllPosts,
    getPostDetails,
    updatePostStatus,
    deletePost,
    updatePostPinStatus,
    updatePostHotStatus,
  };
}