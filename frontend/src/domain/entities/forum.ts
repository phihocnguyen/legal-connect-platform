export interface ForumStatsDto {
  totalTopics: number;
  totalPosts: number;
  totalMembers: number;
  topicsToday: number;
  postsToday: number;
  membersToday: number;
}

export interface PopularTopicDto {
  id: number;
  title: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  views: number;
  replyCount: number;
  badge?: "hot" | "solved" | "trending" | null;
}

export interface CategoryStatsDto {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  topicCount: number;
  totalPostCount: number;
  topicsToday: number;
}

export interface PopularTagDto {
  tag: string;
  count: number;
}
