import { PostRepository } from '../../domain/interfaces/repositories';
import { 
  Post, 
  PostDto, 
  PostCreateDto, 
  PostCategoryDto, 
  PostReplyDto, 
  AddReplyDto,
  ForumStatsDto,
  PopularTopicDto,
  CategoryStatsDto,
  PopularTagDto
} from '../../domain/entities';
import { apiClient } from '../../lib/axiosInstance';

export class HttpPostRepository implements PostRepository {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL;

  private async request(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async getPosts(params: {
    category?: string;
    page?: number;
    limit?: number;
    tag?: string;
  }): Promise<{ posts: Post[]; total: number }> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString());
    });

    return this.request(`/posts?${queryParams.toString()}`);
  }

  async getPost(id: string): Promise<Post> {
    return this.request(`/posts/${id}`);
  }

  async createPost(data: {
    title: string;
    content: string;
    categoryId: number;
    tags: string[];
  }): Promise<Post> {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post> {
    return this.request(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deletePost(id: string): Promise<void> {
    await this.request(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async votePost(id: string, voteType: 1 | -1): Promise<Post> {
    return this.request(`/posts/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ voteType }),
    });
  }

  // New Forum API methods
  async getAllCategories(): Promise<PostCategoryDto[]> {
    const response = await apiClient.get<PostCategoryDto[]>('/forum/categories');
    return response.data;
  }

  async getCategoryBySlug(slug: string): Promise<PostCategoryDto> {
    const response = await apiClient.get<PostCategoryDto>(`/forum/categories/${slug}`);
    return response.data;
  }

  async getAllPosts(params: { page?: number; size?: number; sort?: string; categoryId?: number; timeFilter?: string }): Promise<{
    content: PostDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.categoryId !== undefined) queryParams.append('categoryId', params.categoryId.toString());
    if (params.timeFilter && params.timeFilter !== 'all') queryParams.append('timeFilter', params.timeFilter);

    const response = await apiClient.get<{
      content: PostDto[];
      page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
      };
    }>(`/forum/posts?${queryParams.toString()}`);
    
    // Transform response to expected format
    return {
      content: response.data.content,
      totalElements: response.data.page.totalElements,
      totalPages: response.data.page.totalPages,
      size: response.data.page.size,
      number: response.data.page.number,
    };
  }

  async getPostsByCategory(
    categorySlug: string, 
    params: { page?: number; size?: number; sort?: string }
  ): Promise<{
    content: PostDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const response = await apiClient.get<{
      content: PostDto[];
      page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
      };
    }>(
      `/forum/categories/${categorySlug}/posts?${queryParams.toString()}`
    );
    
    // Transform response to expected format
    return {
      content: response.data.content,
      totalElements: response.data.page.totalElements,
      totalPages: response.data.page.totalPages,
      size: response.data.page.size,
      number: response.data.page.number,
    };
  }

  async searchPosts(
    keyword: string, 
    params: { page?: number; size?: number; sort?: string }
  ): Promise<{
    content: PostDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('keyword', keyword);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const response = await apiClient.get<{
      content: PostDto[];
      page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
      };
    }>(`/forum/posts/search?${queryParams.toString()}`);
    
    // Transform response to expected format
    return {
      content: response.data.content,
      totalElements: response.data.page.totalElements,
      totalPages: response.data.page.totalPages,
      size: response.data.page.size,
      number: response.data.page.number,
    };
  }

  async searchPostsByCategory(
    keyword: string,
    categorySlug: string, 
    params: { page?: number; size?: number; sort?: string }
  ): Promise<{
    content: PostDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }> {
    const queryParams = new URLSearchParams();
    queryParams.append('keyword', keyword);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.sort) queryParams.append('sort', params.sort);

    const response = await apiClient.get<{
      content: PostDto[];
      page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
      };
    }>(
      `/forum/categories/${categorySlug}/posts/search?${queryParams.toString()}`
    );
    
    // Transform response to expected format
    return {
      content: response.data.content,
      totalElements: response.data.page.totalElements,
      totalPages: response.data.page.totalPages,
      size: response.data.page.size,
      number: response.data.page.number,
    };
  }

  async getPostById(id: number): Promise<PostDto> {
    const response = await apiClient.get<PostDto>(`/forum/posts/${id}`);
    return response.data;
  }

  async createPostNew(data: PostCreateDto): Promise<PostDto> {
    const response = await apiClient.post<PostDto>('/forum/posts', data);
    return response.data;
  }

  async updatePostNew(id: number, data: PostCreateDto): Promise<PostDto> {
    const response = await apiClient.put<PostDto>(`/forum/posts/${id}`, data);
    return response.data;
  }

  async deletePostNew(id: number): Promise<void> {
    await apiClient.delete(`/forum/posts/${id}`);
  }

  async getRepliesByPost(postId: number): Promise<PostReplyDto[]> {
    const response = await apiClient.get<PostReplyDto[]>(`/forum/posts/${postId}/replies`);
    return response.data;
  }

  async addReply(postId: number, data: AddReplyDto): Promise<PostReplyDto> {
    const response = await apiClient.post<PostReplyDto>(`/forum/posts/${postId}/replies`, data);
    return response.data;
  }

  async deleteReply(replyId: number): Promise<void> {
    await apiClient.delete(`/forum/replies/${replyId}`);
  }

  // Statistics API methods
  async getForumStats(): Promise<ForumStatsDto> {
    const response = await apiClient.get<ForumStatsDto>('/forum/stats');
    return response.data;
  }

  async getPopularTopics(limit: number = 5): Promise<PopularTopicDto[]> {
    const response = await apiClient.get<PopularTopicDto[]>(`/forum/popular-topics?limit=${limit}`);
    return response.data;
  }

  async getCategoryStats(): Promise<CategoryStatsDto[]> {
    const response = await apiClient.get<CategoryStatsDto[]>('/forum/category-stats');
    return response.data;
  }

  async getPopularTags(limit: number = 10): Promise<PopularTagDto[]> {
    const response = await apiClient.get<PopularTagDto[]>(`/forum/popular-tags?limit=${limit}`);
    return response.data;
  }
}
