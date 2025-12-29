// Vote entities
export interface VoteDto {
  upvotes: number;
  downvotes: number;
  totalVotes: number;
  userVote?: "up" | "down" | null;
}
