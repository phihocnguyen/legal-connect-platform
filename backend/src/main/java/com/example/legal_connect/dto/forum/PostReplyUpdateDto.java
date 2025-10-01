package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostReplyUpdateDto {
    
    @Size(min = 10, message = "Nội dung phải có ít nhất 10 ký tự")
    private String content;
    
    private Boolean isSolution; // Only post author or admin/moderator can set this
    
    private Boolean isActive; // Only admin/moderator can set this
}