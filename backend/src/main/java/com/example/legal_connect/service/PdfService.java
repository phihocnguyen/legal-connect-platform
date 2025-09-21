package com.example.legal_connect.service;

import com.example.legal_connect.dto.conversation.PdfUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface PdfService {
    
    /**
     * Upload PDF file and create a conversation
     */
    PdfUploadResponse uploadPdfAndCreateConversation(MultipartFile file, String title, String summary, Long userId);
    
    /**
     * Get PDF document for a conversation
     */
    byte[] getPdfContent(Long conversationId, Long userId);
    
    /**
     * Delete PDF file from storage
     */
    void deletePdfFile(Long conversationId);
    
    /**
     * Validate PDF file
     */
    boolean isValidPdfFile(MultipartFile file);
}