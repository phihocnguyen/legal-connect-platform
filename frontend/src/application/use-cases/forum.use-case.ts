import { 
  ForumStatsDto, 
  PopularTopicDto, 
  CategoryStatsDto, 
  PopularTagDto 
} from '../../domain/entities';
import { ForumRepository } from '../../domain/interfaces/repositories';

/**
 * Use case for getting forum statistics
 */
export class GetForumStatsUseCase {
  constructor(private forumRepository: ForumRepository) {}

  async execute(): Promise<ForumStatsDto> {
    return this.forumRepository.getForumStats();
  }
}

/**
 * Use case for getting popular topics
 */
export class GetPopularTopicsUseCase {
  constructor(private forumRepository: ForumRepository) {}

  async execute(limit: number = 5): Promise<PopularTopicDto[]> {
    return this.forumRepository.getPopularTopics(limit);
  }
}

/**
 * Use case for getting category statistics
 */
export class GetCategoryStatsUseCase {
  constructor(private forumRepository: ForumRepository) {}

  async execute(): Promise<CategoryStatsDto[]> {
    return this.forumRepository.getCategoryStats();
  }
}

/**
 * Use case for getting popular tags
 */
export class GetPopularTagsUseCase {
  constructor(private forumRepository: ForumRepository) {}

  async execute(limit: number = 10): Promise<PopularTagDto[]> {
    return this.forumRepository.getPopularTags(limit);
  }
}
