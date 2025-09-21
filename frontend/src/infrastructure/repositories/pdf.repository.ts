import { PdfRepository } from '../../domain/interfaces/repositories';
import { PdfConversation, PdfMessage, PdfUploadResult, PythonPdfUploadResult, PdfSummaryResult } from '../../domain/entities';
import { apiClient } from '../../lib/axiosInstance';

interface ConversationResponse {
  id: number;
  userId: number;
  type: 'PDF_QA' | 'QA';
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

interface ApiMessageResponse {
  id: number;
  conversationId: number;
  content: string;
  role: 'USER' | 'ASSISTANT';
  createdAt: string;
}

interface ApiConversationWithDetails {
  id: number;
  userId: number;
  type: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  messages?: Array<{
    id: number;
    conversationId: number;
    content: string;
    role: 'USER' | 'ASSISTANT';
    createdAt: string;
  }>;
  pdfDocument?: {
    id: number;
    conversationId: number;
    originalFileName: string;
    filePath: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
  };
}

interface ApiPdfUploadResult {
  success: boolean;
  message: string;
  error?: string;
  conversation?: {
    id: number;
    userId: number;
    title: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    messageCount: number;
  };
  pdfDocument?: {
    id: number;
    conversationId: number;
    originalFileName: string;
    filePath: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
  };
}

export class HttpPdfRepository implements PdfRepository {
  private baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  private pythonApiURL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000';

  async uploadPdf(file: File, title: string): Promise<PdfUploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);

    const response = await apiClient.post<ApiPdfUploadResult>('/pdf/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = response.data;
    
    // Convert and return properly typed result
    const result: PdfUploadResult = {
      success: data.success,
      message: data.message,
      error: data.error,
    };

    if (data.conversation) {
      result.conversation = {
        ...data.conversation,
        type: data.conversation.type as 'PDF_QA' | 'QA',
        createdAt: new Date(data.conversation.createdAt),
        updatedAt: new Date(data.conversation.updatedAt),
      };
    }

    if (data.pdfDocument) {
      result.pdfDocument = {
        ...data.pdfDocument,
        uploadedAt: new Date(data.pdfDocument.uploadedAt),
      };
    }

    return result;
  }

  async getConversations(): Promise<PdfConversation[]> {
    const response = await apiClient.get<ConversationResponse[]>('/conversations', {
      params: { type: 'PDF_QA' }
    });

    return response.data.map((conv: ConversationResponse) => ({
      ...conv,
      createdAt: new Date(conv.createdAt),
      updatedAt: new Date(conv.updatedAt),
    }));
  }

  async getConversation(id: number): Promise<PdfConversation> {
    const response = await apiClient.get<ConversationResponse>(`/conversations/${id}`);

    const data = response.data;
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  async getConversationWithDetails(id: number): Promise<PdfConversation> {
    const response = await apiClient.get<ApiConversationWithDetails>(`/conversations/${id}`, {
      params: { includeDetails: true }
    });

    const data = response.data;
    return {
      ...data,
      type: data.type as 'PDF_QA' | 'QA',
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      messages: data.messages?.map((msg) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
      })),
      pdfDocument: data.pdfDocument ? {
        ...data.pdfDocument,
        uploadedAt: new Date(data.pdfDocument.uploadedAt),
      } : undefined,
    };
  }

  async sendMessage(conversationId: number, content: string): Promise<PdfMessage> {
    const response = await apiClient.post<ApiMessageResponse>('/conversations/messages', {
      conversationId,
      content,
      role: 'USER'
    });

    const data = response.data;
    return {
      ...data,
      createdAt: new Date(data.createdAt),
    };
  }

  async getMessages(conversationId: number): Promise<PdfMessage[]> {
    const response = await apiClient.get<ApiMessageResponse[]>(`/conversations/${conversationId}/messages`);

    return response.data.map((msg) => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    }));
  }

  async deleteConversation(id: number): Promise<void> {
    await apiClient.delete(`/conversations/${id}`);
  }

  async updateConversationTitle(id: number, title: string): Promise<PdfConversation> {
    const response = await apiClient.put<ConversationResponse>(`/conversations/${id}`, {
      title
    });

    const data = response.data;
    return {
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
    };
  }

  getPdfViewUrl(conversationId: number): string {
    return `${this.baseURL}/pdf/view/${conversationId}`;
  }

  getPdfDownloadUrl(conversationId: number): string {
    return `${this.baseURL}/pdf/download/${conversationId}`;
  }

  // Python API methods
  async uploadPdfToPython(file: File): Promise<PythonPdfUploadResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.pythonApiURL}/pdf/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async getPdfSummary(fileId: string, maxLength: number = 200): Promise<PdfSummaryResult> {
    const formData = new URLSearchParams();
    formData.append('file_id', fileId);
    formData.append('max_length', maxLength.toString());
    
    console.log('Sending PDF summary request:', {
      url: `${this.pythonApiURL}/pdf/summarize`,
      fileId: fileId,
      maxLength: maxLength
    });

    const response = await fetch(`${this.pythonApiURL}/pdf/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PDF summary API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    console.log('PDF summary result:', result);
    return result;
  }
}