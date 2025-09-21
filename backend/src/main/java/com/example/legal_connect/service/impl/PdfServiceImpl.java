package com.example.legal_connect.service.impl;

import com.example.legal_connect.dto.conversation.ConversationDto;
import com.example.legal_connect.dto.conversation.PdfDocumentDto;
import com.example.legal_connect.dto.conversation.PdfUploadResponse;
import com.example.legal_connect.entity.Conversation;
import com.example.legal_connect.entity.PdfDocument;
import com.example.legal_connect.mapper.ConversationMapper;
import com.example.legal_connect.repository.ConversationRepository;
import com.example.legal_connect.repository.PdfDocumentRepository;
import com.example.legal_connect.service.PdfService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PdfServiceImpl implements PdfService {

    private final ConversationRepository conversationRepository;
    private final PdfDocumentRepository pdfDocumentRepository;
    private final ConversationMapper conversationMapper;

    @Value("${app.pdf.upload-dir}")
    private String uploadDir;

    @Value("${app.pdf.max-size}")
    private long maxFileSize;

    @Override
    public PdfUploadResponse uploadPdfAndCreateConversation(MultipartFile file, String title, String summary, Long userId) {
        log.info("Uploading PDF file for user: {}, title: {}", userId, title);
        
        try {
            // Validate file
            if (!isValidPdfFile(file)) {
                return PdfUploadResponse.error("Invalid PDF file");
            }

            // Create conversation first with summary
            Conversation conversation = Conversation.builder()
                    .userId(userId)
                    .type(Conversation.ConversationType.PDF_QA)
                    .title(title)
                    .summary(summary)
                    .build();
            
            conversation = conversationRepository.save(conversation);

            // Save file to storage
            String fileName = generateUniqueFileName(file.getOriginalFilename());
            Path filePath = saveFileToStorage(file, fileName);

            // Save PDF document info to database
            PdfDocument pdfDocument = PdfDocument.builder()
                    .conversationId(conversation.getId())
                    .originalFileName(file.getOriginalFilename())
                    .filePath(filePath.toString())
                    .fileSize(file.getSize())
                    .contentType(file.getContentType())
                    .build();

            pdfDocument = pdfDocumentRepository.save(pdfDocument);

            // Convert to DTOs
            ConversationDto conversationDto = conversationMapper.toDto(conversation);
            PdfDocumentDto pdfDocumentDto = conversationMapper.toPdfDocumentDto(pdfDocument);

            return PdfUploadResponse.success(conversationDto, pdfDocumentDto);

        } catch (Exception e) {
            log.error("Error uploading PDF file", e);
            return PdfUploadResponse.error("Error uploading file: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getPdfContent(Long conversationId, Long userId) {
        log.info("Getting PDF content for conversation: {} by user: {}", conversationId, userId);
        
        // Verify user has access to the conversation
        conversationRepository.findByIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new RuntimeException("Conversation not found or access denied"));

        PdfDocument pdfDocument = pdfDocumentRepository.findByConversationId(conversationId)
                .orElseThrow(() -> new RuntimeException("PDF document not found"));

        try {
            Path filePath = Paths.get(pdfDocument.getFilePath());
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.error("Error reading PDF file", e);
            throw new RuntimeException("Error reading PDF file", e);
        }
    }

    @Override
    public void deletePdfFile(Long conversationId) {
        log.info("Deleting PDF file for conversation: {}", conversationId);
        
        pdfDocumentRepository.findByConversationId(conversationId)
                .ifPresent(pdfDocument -> {
                    try {
                        Path filePath = Paths.get(pdfDocument.getFilePath());
                        Files.deleteIfExists(filePath);
                        pdfDocumentRepository.deleteByConversationId(conversationId);
                    } catch (IOException e) {
                        log.error("Error deleting PDF file", e);
                    }
                });
    }

    @Override
    public boolean isValidPdfFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        // Check file size
        if (file.getSize() > maxFileSize) {
            log.warn("File size exceeds maximum allowed: {} bytes", file.getSize());
            return false;
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            log.warn("Invalid content type: {}", contentType);
            return false;
        }

        // Check file extension
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".pdf")) {
            log.warn("Invalid file extension: {}", originalFilename);
            return false;
        }

        return true;
    }

    private String generateUniqueFileName(String originalFilename) {
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return UUID.randomUUID().toString() + extension;
    }

    private Path saveFileToStorage(MultipartFile file, String fileName) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file
        Path filePath = uploadPath.resolve(fileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        
        return filePath;
    }
}