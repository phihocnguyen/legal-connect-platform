import {
  ForumStatsDto,
  PopularTopicDto,
  CategoryStatsDto,
  PopularTagDto,
} from '../../domain/entities';
import { apiClient } from '../../lib/axiosInstance';
import { ForumRepository } from '@/domain/interfaces/repositories';

export class HttpForumRepository implements ForumRepository {
  /**
   * Get forum statistics
   */
  async getForumStats(): Promise<ForumStatsDto> {
    const response = await apiClient.get<ForumStatsDto>('/forum/stats');
    return response.data;
  }

  /**
   * Get popular topics
   */
  async getPopularTopics(limit: number = 5): Promise<PopularTopicDto[]> {
    const response = await apiClient.get<PopularTopicDto[]>(
      `/forum/popular-topics?limit=${limit}`
    );
    return response.data;
  }

  /**
   * Get category statistics
   */
  async getCategoryStats(): Promise<CategoryStatsDto[]> {
    const response = await apiClient.get<CategoryStatsDto[]>('/forum/category-stats');
    return response.data;
  }

  /**
   * Get popular tags
   */
  async getPopularTags(limit: number = 10): Promise<PopularTagDto[]> {
    const response = await apiClient.get<PopularTagDto[]>(
      `/forum/popular-tags?limit=${limit}`
    );
    return response.data;
  }
}
