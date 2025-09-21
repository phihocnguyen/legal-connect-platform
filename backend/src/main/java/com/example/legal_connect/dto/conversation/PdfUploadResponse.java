package com.example.legal_connect.dto.conversation;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfUploadResponse {
    private boolean success;
    private String message;
    private ConversationDto conversation;
    private PdfDocumentDto pdfDocument;
    private String error;

    public static PdfUploadResponse success(ConversationDto conversation, PdfDocumentDto pdfDocument) {
        return PdfUploadResponse.builder()
                .success(true)
                .message("PDF uploaded successfully")
                .conversation(conversation)
                .pdfDocument(pdfDocument)
                .build();
    }

    public static PdfUploadResponse error(String error) {
        return PdfUploadResponse.builder()
                .success(false)
                .error(error)
                .message("Failed to upload PDF")
                .build();
    }
}