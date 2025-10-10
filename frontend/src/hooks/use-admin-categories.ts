import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/axiosInstance';
import { PostCategoryDto } from '@/domain/entities';

interface CategoryFormData {
  name: string;
  description: string;
  slug: string;
}

interface CategoryCreateData extends CategoryFormData {
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface CategoryUpdateData extends CategoryFormData {
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

interface UseAdminCategoriesReturn {
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  getAllCategories: (params?: {
    page?: number;
    size?: number;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
  }) => Promise<{
    content: PostCategoryDto[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  }>;
  
  createCategory: (data: CategoryCreateData) => Promise<PostCategoryDto>;
  updateCategory: (id: number, data: CategoryUpdateData) => Promise<PostCategoryDto>;
  deleteCategory: (id: number) => Promise<void>;
  toggleCategoryStatus: (id: number, isActive: boolean) => Promise<void>;
}

export function useAdminCategories(): UseAdminCategoriesReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllCategories = useCallback(async (params?: {
    page?: number;
    size?: number;
    search?: string;
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
      if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

      const response = await apiClient.get(`/admin/categories?${queryParams.toString()}`);

      // The backend returns ApiResponse<Page<PostCategoryDto>>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (apiResponse.success && apiResponse.data) {
        return {
          content: apiResponse.data.content as PostCategoryDto[],
          totalPages: apiResponse.data.totalPages,
          totalElements: apiResponse.data.totalElements,
          size: apiResponse.data.size,
          number: apiResponse.data.number,
        };
      }
      
      throw new Error(apiResponse.message || 'Failed to fetch categories');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: CategoryCreateData): Promise<PostCategoryDto> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/admin/categories', data);

      // The backend returns ApiResponse<PostCategoryDto>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data as PostCategoryDto;
      }
      
      throw new Error(apiResponse.message || 'Failed to create category');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: number, data: CategoryUpdateData): Promise<PostCategoryDto> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/admin/categories/${id}`, data);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data as PostCategoryDto;
      }
      
      throw new Error(apiResponse.message || 'Failed to update category');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.delete(`/admin/categories/${id}`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to delete category');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleCategoryStatus = useCallback(async (id: number, isActive: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put(`/admin/categories/${id}/status?isActive=${isActive}`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiResponse = response.data as any;
      
      if (!apiResponse.success) {
        throw new Error(apiResponse.message || 'Failed to update category status');
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
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  };
}