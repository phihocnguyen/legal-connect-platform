package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.Size;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostUpdateDto {
    
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;
    
    @Size(min = 30, message = "Nội dung phải có ít nhất 30 ký tự")
    private String content;
    
    private Long categoryId;
    
    @Size(max = 5, message = "Không được vượt quá 5 thẻ")
    private Set<String> tags;
    
    private Boolean pinned;
    
    private Boolean solved;
    
    private Boolean isHot;
    
    private Boolean isActive;
}