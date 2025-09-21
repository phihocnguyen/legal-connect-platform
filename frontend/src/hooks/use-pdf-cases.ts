import { useCallback } from 'react';
import { container } from '@/infrastructure/container';
import {
  UploadPdfUseCase,
  GetConversationsUseCase,
  GetConversationUseCase,
  GetConversationWithDetailsUseCase,
  SendMessageUseCase,
  GetMessagesUseCase,
  DeleteConversationUseCase,
  UploadPdfToPythonUseCase,
  GetPdfSummaryUseCase,
} from '@/application/use-cases/pdf.use-case';

export const usePdfCases = () => {
  const uploadPdfUseCase = container.getUseCase<UploadPdfUseCase>('UploadPdfUseCase');
  const getPdfConversationsUseCase = container.getUseCase<GetConversationsUseCase>('GetPdfConversationsUseCase');
  const getPdfConversationUseCase = container.getUseCase<GetConversationUseCase>('GetPdfConversationUseCase');
  const getPdfConversationWithDetailsUseCase = container.getUseCase<GetConversationWithDetailsUseCase>('GetPdfConversationWithDetailsUseCase');
  const sendPdfMessageUseCase = container.getUseCase<SendMessageUseCase>('SendPdfMessageUseCase');
  const getPdfMessagesUseCase = container.getUseCase<GetMessagesUseCase>('GetPdfMessagesUseCase');
  const deletePdfConversationUseCase = container.getUseCase<DeleteConversationUseCase>('DeletePdfConversationUseCase');
  
  // Python API use cases
  const uploadPdfToPythonUseCase = container.getUseCase<UploadPdfToPythonUseCase>('UploadPdfToPythonUseCase');
  const getPdfSummaryUseCase = container.getUseCase<GetPdfSummaryUseCase>('GetPdfSummaryUseCase');

  const uploadPdf = useCallback(async (file: File, title: string) => {
    return uploadPdfUseCase.execute(file, title);
  }, [uploadPdfUseCase]);

  const getConversations = useCallback(async () => {
    return getPdfConversationsUseCase.execute();
  }, [getPdfConversationsUseCase]);

  const getConversation = useCallback(async (conversationId: number) => {
    return getPdfConversationUseCase.execute(conversationId);
  }, [getPdfConversationUseCase]);

  const getConversationWithDetails = useCallback(async (conversationId: number) => {
    return getPdfConversationWithDetailsUseCase.execute(conversationId);
  }, [getPdfConversationWithDetailsUseCase]);

  const sendMessage = useCallback(async (conversationId: number, content: string) => {
    return sendPdfMessageUseCase.execute(conversationId, content);
  }, [sendPdfMessageUseCase]);

  const getMessages = useCallback(async (conversationId: number) => {
    return getPdfMessagesUseCase.execute(conversationId);
  }, [getPdfMessagesUseCase]);

  const deleteConversation = useCallback(async (conversationId: number) => {
    return deletePdfConversationUseCase.execute(conversationId);
  }, [deletePdfConversationUseCase]);

  const getPdfViewUrl = useCallback((conversationId: number) => {
    const pdfRepo = container.getRepository('PdfRepository') as { getPdfViewUrl: (id: number) => string };
    return pdfRepo.getPdfViewUrl(conversationId);
  }, []);

  // Python API methods
  const uploadPdfToPython = useCallback(async (file: File) => {
    return uploadPdfToPythonUseCase.execute(file);
  }, [uploadPdfToPythonUseCase]);

  const getPdfSummary = useCallback(async (fileId: string, maxLength?: number) => {
    return getPdfSummaryUseCase.execute(fileId, maxLength);
  }, [getPdfSummaryUseCase]);

  return {
    uploadPdf,
    getConversations,
    getConversation,
    getConversationWithDetails,
    sendMessage,
    getMessages,
    deleteConversation,
    getPdfViewUrl,
    
    // Python API methods
    uploadPdfToPython,
    getPdfSummary,
  };
};