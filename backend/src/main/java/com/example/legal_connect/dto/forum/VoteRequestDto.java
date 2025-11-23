package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteRequestDto {
    
    @NotNull(message = "Vote type is required")
    @Pattern(regexp = "UPVOTE|DOWNVOTE|NONE", message = "Vote type must be UPVOTE, DOWNVOTE, or NONE")
    private String voteType; // UPVOTE, DOWNVOTE, or NONE to remove vote
}

