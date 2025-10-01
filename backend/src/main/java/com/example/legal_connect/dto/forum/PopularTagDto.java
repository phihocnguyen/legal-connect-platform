package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

/**
 * DTO for popular tags
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PopularTagDto {
    
    private String tag;
    private Long count;
}
