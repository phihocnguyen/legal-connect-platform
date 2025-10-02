package com.example.legal_connect.controller;

import com.example.legal_connect.dto.conversation.PdfUploadResponse;
import com.example.legal_connect.security.UserPrincipal;
import com.example.legal_connect.service.ApiKeyValidationService;
import com.example.legal_connect.service.PdfService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
@Tag(name = "PDF", description = "PDF document management APIs")
public class PdfController {

    private final PdfService pdfService;
    private final ApiKeyValidationService apiKeyValidationService;

    @PostMapping("/upload")
    @Operation(summary = "Upload PDF file and create a new PDF-QA conversation")
    public ResponseEntity<PdfUploadResponse> uploadPdf(
            @Parameter(description = "PDF file to upload")
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Title for the conversation")
            @RequestParam("title") String title,
            @Parameter(description = "Summary of the PDF content")
            @RequestParam(value = "summary", required = false) String summary,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            // Validate and deduct API key
            apiKeyValidationService.validateAndUseApiKey(userPrincipal.getId(), "pdf");
            
            PdfUploadResponse response = pdfService.uploadPdfAndCreateConversation(file, title, summary, userPrincipal.getId());
            
            if (response.isSuccess()) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(response);
            }
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(PdfUploadResponse.builder()
                            .success(false)
                            .message(e.getMessage())
                            .build());
        }
    }

    @GetMapping("/download/{conversationId}")
    @Operation(summary = "Download PDF file for a conversation")
    public ResponseEntity<ByteArrayResource> downloadPdf(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            byte[] pdfContent = pdfService.getPdfContent(conversationId, userPrincipal.getId());
            ByteArrayResource resource = new ByteArrayResource(pdfContent);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=document.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfContent.length)
                    .body(resource);
                    
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/view/{conversationId}")
    @Operation(summary = "View PDF file inline for a conversation")
    public ResponseEntity<ByteArrayResource> viewPdf(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal UserPrincipal userPrincipal) {
        
        try {
            byte[] pdfContent = pdfService.getPdfContent(conversationId, userPrincipal.getId());
            ByteArrayResource resource = new ByteArrayResource(pdfContent);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=document.pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .contentLength(pdfContent.length)
                    .body(resource);
                    
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}