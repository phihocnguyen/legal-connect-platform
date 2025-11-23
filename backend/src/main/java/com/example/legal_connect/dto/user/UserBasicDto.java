package com.example.legal_connect.dto.user;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserBasicDto {
    private Long id;
    private String name;
    private String email;
    private String avatar;
    private String role;
}

