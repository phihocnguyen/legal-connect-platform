'use client';

import { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { VoteType } from '@/domain/entities';
import { useVoteUseCases } from '@/application/use-cases/vote.use-case';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  entityId: number;
  entityType: 'post' | 'reply';
  upvoteCount: number;
  downvoteCount: number;
  userVote?: VoteType | null;
  className?: string;
}

export function VoteButtons({
  entityId,
  entityType,
  upvoteCount: initialUpvoteCount,
  downvoteCount: initialDownvoteCount,
  userVote: initialUserVote,
  className
}: VoteButtonsProps) {
  const { voteOnPost, voteOnReply } = useVoteUseCases();
  
  const [upvoteCount, setUpvoteCount] = useState(initialUpvoteCount || 0);
  const [downvoteCount, setDownvoteCount] = useState(initialDownvoteCount || 0);
  const [userVote, setUserVote] = useState<VoteType | null>(initialUserVote || null);
  const [isVoting, setIsVoting] = useState(false);

  console.log('VoteButtons props:', {
    entityId,
    entityType,
    initialUpvoteCount,
    initialDownvoteCount,
    initialUserVote,
    initialUserVoteType: typeof initialUserVote,
    initialUserVoteValue: JSON.stringify(initialUserVote),
    userVote,
    userVoteType: typeof userVote,
    userVoteValue: JSON.stringify(userVote),
    isUpvoteHighlighted: userVote === 'UPVOTE',
    isDownvoteHighlighted: userVote === 'DOWNVOTE'
  });

  // Sync state with props when they change
  useEffect(() => {
    console.log('VoteButtons useEffect - syncing with props:', {
      initialUpvoteCount,
      initialDownvoteCount,
      initialUserVote,
      initialUserVoteIsUpvote: initialUserVote === 'UPVOTE',
      initialUserVoteIsDownvote: initialUserVote === 'DOWNVOTE'
    });
    setUpvoteCount(initialUpvoteCount || 0);
    setDownvoteCount(initialDownvoteCount || 0);
    setUserVote(initialUserVote || null);
  }, [initialUpvoteCount, initialDownvoteCount, initialUserVote]);

  const handleVote = async (voteType: VoteType) => {
    if (isVoting) return;

    setIsVoting(true);
    
    // Optimistic update
    const previousUpvoteCount = upvoteCount;
    const previousDownvoteCount = downvoteCount;
    const previousUserVote = userVote;

    try {
      // Calculate new counts optimistically
      let newUpvoteCount = upvoteCount;
      let newDownvoteCount = downvoteCount;
      let newUserVote: VoteType | null = voteType;

      if (userVote === voteType) {
        // User is removing their vote
        newUserVote = null;
        if (voteType === 'UPVOTE') {
          newUpvoteCount = Math.max(0, upvoteCount - 1);
        } else {
          newDownvoteCount = Math.max(0, downvoteCount - 1);
        }
      } else if (userVote === null) {
        // User is adding a new vote
        if (voteType === 'UPVOTE') {
          newUpvoteCount = upvoteCount + 1;
        } else {
          newDownvoteCount = downvoteCount + 1;
        }
      } else {
        // User is switching vote
        if (voteType === 'UPVOTE') {
          newUpvoteCount = upvoteCount + 1;
          newDownvoteCount = Math.max(0, downvoteCount - 1);
        } else {
          newDownvoteCount = downvoteCount + 1;
          newUpvoteCount = Math.max(0, upvoteCount - 1);
        }
      }

      // Update UI immediately
      setUpvoteCount(newUpvoteCount);
      setDownvoteCount(newDownvoteCount);
      setUserVote(newUserVote);

      // Send request to server
      const finalVoteType = userVote === voteType ? 'NONE' : voteType;
      const result = entityType === 'post'
        ? await voteOnPost(entityId, finalVoteType)
        : await voteOnReply(entityId, finalVoteType);

      if (result) {
        // Update with actual server response
        setUpvoteCount(result.upvoteCount);
        setDownvoteCount(result.downvoteCount);
        setUserVote(result.userVote || null);
      }
    } catch (error) {
      console.error('Failed to vote:', error);
      // Revert optimistic update on error
      setUpvoteCount(previousUpvoteCount);
      setDownvoteCount(previousDownvoteCount);
      setUserVote(previousUserVote);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button
        onClick={() => handleVote('UPVOTE')}
        disabled={isVoting}
        className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200",
          "border border-gray-300 hover:border-blue-400 hover:bg-blue-50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          userVote === 'UPVOTE' && "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600"
        )}
        aria-label="Upvote"
      >
        <ChevronUp className={cn("w-5 h-5", userVote === 'UPVOTE' && "stroke-2")} />
        <span className="text-sm font-medium">{upvoteCount}</span>
      </button>

      <button
        onClick={() => handleVote('DOWNVOTE')}
        disabled={isVoting}
        className={cn(
          "flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-200",
          "border border-gray-300 hover:border-red-400 hover:bg-red-50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          userVote === 'DOWNVOTE' && "bg-red-500 text-white border-red-500 hover:bg-red-600 hover:border-red-600"
        )}
        aria-label="Downvote"
      >
        <ChevronDown className={cn("w-5 h-5", userVote === 'DOWNVOTE' && "stroke-2")} />
        <span className="text-sm font-medium">{downvoteCount}</span>
      </button>
    </div>
  );
}

