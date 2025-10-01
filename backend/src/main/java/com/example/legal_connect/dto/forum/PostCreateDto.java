package com.example.legal_connect.dto.forum;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostCreateDto {
    
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;
    
    @NotBlank(message = "Nội dung không được để trống")
    @Size(min = 30, message = "Nội dung phải có ít nhất 30 ký tự")
    private String content;
    
    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;
    
    @Size(max = 5, message = "Không được vượt quá 5 thẻ")
    private Set<String> tags;
    
    // Optional fields
    @Builder.Default
    private Boolean pinned = false;
    
    @Builder.Default
    private Boolean isHot = false;
}