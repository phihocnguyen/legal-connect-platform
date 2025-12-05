import { useState, useCallback } from 'react';
import { voteRepository } from '@/infrastructure/repositories/vote-repository';
import { VoteDto, VoteType } from '@/domain/entities';

export const useVoteUseCases = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const voteOnPost = useCallback(async (postId: number, voteType: VoteType): Promise<VoteDto | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await voteRepository.voteOnPost(postId, voteType);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote on post';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const voteOnReply = useCallback(async (replyId: number, voteType: VoteType): Promise<VoteDto | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await voteRepository.voteOnReply(replyId, voteType);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote on reply';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPostVoteStats = useCallback(async (postId: number): Promise<VoteDto | null> => {
    try {
      const result = await voteRepository.getPostVoteStats(postId);
      return result;
    } catch (err) {
      console.error('Failed to get post vote stats:', err);
      return null;
    }
  }, []);

  const getReplyVoteStats = useCallback(async (replyId: number): Promise<VoteDto | null> => {
    try {
      const result = await voteRepository.getReplyVoteStats(replyId);
      return result;
    } catch (err) {
      console.error('Failed to get reply vote stats:', err);
      return null;
    }
  }, []);

  return {
    voteOnPost,
    voteOnReply,
    getPostVoteStats,
    getReplyVoteStats,
    loading,
    error
  };
};

