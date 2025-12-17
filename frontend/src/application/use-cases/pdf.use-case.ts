import {
  PdfConversation,
  PdfMessage,
  PdfUploadResult,
  PythonPdfUploadResult,
  PdfSummaryResult,
} from "../../domain/entities";
import { PdfRepository } from "../../domain/interfaces/repositories";

export class UploadPdfUseCase {
  constructor(private pdfRepository: PdfRepository) {}

  async execute(
    file: File,
    title: string,
    summary?: string,
    pythonFileId?: string
  ): Promise<PdfUploadResult> {
    return this.pdfRepository.uploadPdf(file, title, summary, pythonFileId);
  }
}

export class GetConversationsUseCase {
  constructor(private pdfRepository: PdfRepository) {}

  async execute(): Promise<PdfConversation[]> {
    return this.pdfRepository.getConversations();
  }
}

export class GetConversationUseCase {
  constructor(private pdfRepository: PdfRepository) {}

  async execute(conversationId: number): Promise<PdfConversation> {
    return this.pdfRepository.getConversation(conversationId);
  }
}

export class GetConversationWithDetailsUseCase {
  constructor(private pdfRepository: PdfRepository) {}

  async execute(conversationId: number): Promise<PdfConversation> {
    return this.pdfRepository.getConversationWithDetails(conversationId);
  }
}

export class SendMessageUseCase {
  constructor(private pdfRepository: PdfRepository) {}

  async execute(conversationId: number, content: string): Promise<PdfMessage> {
    return this.pdfRepository.sendMessage(conversationId, content);
  }
}

export class GetMessagesUseCase {
  constructor(private pdfRepository: PdfRepository) {}

  async execute(conversationId: number): Promise<PdfMessage[]> {
    return this.pdfRepository.getMessages(conversationId);
  }
}

export class DeleteConversationUseCase {
  constructor(private pdfRepository: PdfRepository) {}

  async execute(conversationId: number): Promise<void> {
    return this.pdfRepository.deleteConversation(conversationId);
  }
}

// Python API Use Cases
export class UploadPdfToPythonUseCase {
  constructor(private pdfRepository: PdfRepository) {}

  async execute(file: File): Promise<PythonPdfUploadResult> {
    return this.pdfRepository.uploadPdfToPython(file);
  }
}

export class GetPdfSummaryUseCase {
  constructor(private pdfRepository: PdfRepository) {}

  async execute(fileId: string, maxLength?: number): Promise<PdfSummaryResult> {
    return this.pdfRepository.getPdfSummary(fileId, maxLength);
  }
}

export class AskPdfQuestionUseCase {
  constructor(private pdfRepository: PdfRepository) {}

  async execute(
    fileId: string,
    question: string,
    topK?: number
  ): Promise<import("../../domain/entities").PdfQAResponse> {
    return this.pdfRepository.askPdfQuestion(fileId, question, topK);
  }
}
