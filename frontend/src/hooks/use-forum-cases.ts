import { useCallback } from 'react';
import { container } from '../infrastructure/container';
import {
  GetForumStatsUseCase,
  GetPopularTopicsUseCase,
  GetCategoryStatsUseCase,
  GetPopularTagsUseCase,
} from '../application/use-cases/forum.use-case';

/**
 * Hook to access forum statistics use cases
 */
export function useForumUseCases() {
  /**
   * Get forum statistics (total topics, posts, members, etc.)
   */
  const getForumStats = useCallback(() => {
    const useCase = container.getUseCase<GetForumStatsUseCase>('GetForumStatsUseCase');
    return useCase.execute();
  }, []);

  /**
   * Get popular topics
   * @param limit - Number of topics to retrieve (default: 5)
   */
  const getPopularTopics = useCallback((limit: number = 5) => {
    const useCase = container.getUseCase<GetPopularTopicsUseCase>('GetPopularTopicsUseCase');
    return useCase.execute(limit);
  }, []);

  /**
   * Get category statistics
   */
  const getCategoryStats = useCallback(() => {
    const useCase = container.getUseCase<GetCategoryStatsUseCase>('GetCategoryStatsUseCase');
    return useCase.execute();
  }, []);

  /**
   * Get popular tags
   * @param limit - Number of tags to retrieve (default: 10)
   */
  const getPopularTags = useCallback((limit: number = 10) => {
    const useCase = container.getUseCase<GetPopularTagsUseCase>('GetPopularTagsUseCase');
    return useCase.execute(limit);
  }, []);

  return {
    getForumStats,
    getPopularTopics,
    getCategoryStats,
    getPopularTags,
  };
}
