package com.example.legal_connect.dto.admin;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryCreateDto {
    
    @NotBlank(message = "Category name is required")
    @Size(min = 2, max = 100, message = "Category name must be between 2 and 100 characters")
    private String name;
    
    @NotBlank(message = "Category slug is required")
    @Size(min = 2, max = 100, message = "Category slug must be between 2 and 100 characters")
    private String slug;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    private String icon;
    
    private Integer displayOrder;
    
    @Builder.Default
    private Boolean isActive = true;
}