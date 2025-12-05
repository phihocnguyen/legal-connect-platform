import { useState, useCallback } from 'react';
import { UserProfile, UserPost, ApiKey } from '@/domain/entities';
import { userRepository, apiKeyRepository } from '@/infrastructure/repositories/user-repository';

export const useUserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserProfile = useCallback(async (userId: number): Promise<UserProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const profile = await userRepository.getUserProfile(userId);
      return profile;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserPosts = useCallback(async (userId: number, page: number = 0): Promise<{ content: UserPost[], totalPages: number } | null> => {
    setLoading(true);
    setError(null);
    try {
      const posts = await userRepository.getUserPosts(userId, page);
      return posts;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user posts');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getUserProfile,
    getUserPosts,
  };
};

export const useApiKey = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<ApiKey | null>(null);

  const createApiKey = useCallback(async (): Promise<ApiKey | null> => {
    setLoading(true);
    setError(null);
    try {
      const key = await apiKeyRepository.createApiKey();
      setApiKey(key);
      return key;
    
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create API key');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyApiKey = useCallback(async (): Promise<ApiKey | null> => {
    setLoading(true);
    setError(null);
    try {
      const key = await apiKeyRepository.getMyApiKey();
      setApiKey(key);
      return key;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 400 && err.response?.data?.message?.includes('not found')) {
        return null;
      }
      setError(err.response?.data?.message || 'Failed to fetch API key');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const useApiKeyCall = useCallback(async (type: 'pdf' | 'chat'): Promise<ApiKey | null> => {
    setLoading(true);
    setError(null);
    try {
      const key = await apiKeyRepository.useApiKey(type);
      setApiKey(key);
      return key;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError('API key limit exceeded. You have used all your available calls.');
      } else {
        setError(err.response?.data?.message || 'Failed to use API key');
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkApiKeyLimit = useCallback((key: ApiKey | null): boolean => {
    if (!key) return false;
    return key.remainingCalls > 0 && key.isActive;
  }, []);

  return {
    loading,
    error,
    apiKey,
    createApiKey,
    getMyApiKey,
    useApiKeyCall,
    checkApiKeyLimit,
  };
};
