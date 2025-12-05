import { apiClient } from '@/lib/axiosInstance';
import { VoteDto } from '@/domain/entities';

export class VoteRepository {
  async voteOnPost(postId: number, voteType: string): Promise<VoteDto> {
    const response = await apiClient.post<VoteDto>(
      `/forum/posts/${postId}/vote`,
      { voteType }
    );
    return response.data;
  }

  async voteOnReply(replyId: number, voteType: string): Promise<VoteDto> {
    const response = await apiClient.post<VoteDto>(
      `/forum/replies/${replyId}/vote`,
      { voteType }
    );
    return response.data;
  }

  async getPostVoteStats(postId: number): Promise<VoteDto> {
    const response = await apiClient.get<VoteDto>(
      `/forum/posts/${postId}/votes`
    );
    return response.data;
  }

  async getReplyVoteStats(replyId: number): Promise<VoteDto> {
    const response = await apiClient.get<VoteDto>(
      `/forum/replies/${replyId}/votes`
    );
    return response.data;
  }
}

export const voteRepository = new VoteRepository();

