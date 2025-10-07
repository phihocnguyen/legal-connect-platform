package com.example.legal_connect.controller;

import com.example.legal_connect.dto.common.ApiResponse;
import com.example.legal_connect.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "File Upload", description = "File upload management APIs")
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/documents")
    @Operation(summary = "Upload documents for lawyer application")
    public ResponseEntity<ApiResponse<List<String>>> uploadDocuments(
            @RequestParam("files") MultipartFile[] files) {
        
        try {
            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.<List<String>>builder()
                        .success(false)
                        .message("No files provided")
                        .build());
            }

            // Upload files to Cloudinary
            String[] uploadedUrls = cloudinaryService.uploadFiles(files, "lawyer-documents");
            List<String> urlList = Arrays.asList(uploadedUrls);
            
            return ResponseEntity.ok(ApiResponse.<List<String>>builder()
                .success(true)
                .message("Documents uploaded successfully")
                .data(urlList)
                .build());
                
        } catch (Exception e) {
            log.error("Error uploading documents: {}", e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(ApiResponse.<List<String>>builder()
                    .success(false)
                    .message("Failed to upload documents: " + e.getMessage())
                    .build());
        }
    }

    @PostMapping("/avatar")
    @Operation(summary = "Upload avatar image")
    public ResponseEntity<ApiResponse<String>> uploadAvatar(
            @RequestParam("file") MultipartFile file) {
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.<String>builder()
                        .success(false)
                        .message("No file provided")
                        .build());
            }
            
            // Upload file to Cloudinary
            String uploadedUrl = cloudinaryService.uploadFile(file, "avatars");
            
            return ResponseEntity.ok(ApiResponse.<String>builder()
                .success(true)
                .message("Avatar uploaded successfully")
                .data(uploadedUrl)
                .build());
                
        } catch (Exception e) {
            log.error("Error uploading avatar: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.<String>builder()
                    .success(false)
                    .message("Error uploading avatar: " + e.getMessage())
                    .build());
        }
    }
}