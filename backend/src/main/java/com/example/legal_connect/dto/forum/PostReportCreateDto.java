package com.example.legal_connect.dto.forum;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostReportCreateDto {
    
    @NotBlank(message = "Lý do báo cáo không được để trống")
    @Size(max = 100, message = "Lý do không được vượt quá 100 ký tự")
    private String reason;
    
    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;
}

