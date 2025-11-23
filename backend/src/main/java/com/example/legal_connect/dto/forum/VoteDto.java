package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VoteDto {
    
    private String voteType; // UPVOTE, DOWNVOTE, or null if no vote
    
    private Integer upvoteCount;
    
    private Integer downvoteCount;
    
    private String userVote; // Current user's vote (UPVOTE/DOWNVOTE/null)
}

