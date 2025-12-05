import { UserProfile, UserPost, ApiKey } from '@/domain/entities';
import axiosInstance from '@/lib/axiosInstance';

export const userRepository = {
  async getUserProfile(userId: number): Promise<UserProfile> {
    const response = await axiosInstance.get(`/users/${userId}`);
    return response.data.data;
  },

  async getUserPosts(userId: number, page: number = 0, size: number = 20): Promise<{ content: UserPost[], totalPages: number, totalElements: number }> {
    const response = await axiosInstance.get(`/users/${userId}/posts`, {
      params: { page, size, sort: 'createdAt,desc' }
    });
    return response.data;
  },
};

export const apiKeyRepository = {
  async createApiKey(): Promise<ApiKey> {
    const response = await axiosInstance.post('/api-keys');
    return response.data.data;
  },

  async getMyApiKey(): Promise<ApiKey> {
    const response = await axiosInstance.get('/api-keys/me');
    return response.data.data;
  },

  async useApiKey(type: 'pdf' | 'chat'): Promise<ApiKey> {
    const response = await axiosInstance.put('/api-keys/use', { type });
    return response.data.data;
  },

  async validateApiKey(key: string): Promise<boolean> {
    const response = await axiosInstance.get(`/api-keys/validate/${key}`);
    return response.data.data;
  },
};
