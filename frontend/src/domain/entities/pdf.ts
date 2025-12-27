export interface PdfConversation {
  id: number;
  userId: number;
  type: "PDF_QA" | "QA";
  title: string;
  summary?: string;
  pythonFileId?: string; // Store fileId from Python API for PDF Q/A
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  messages?: PdfMessage[];
  pdfDocument?: PdfDocument;
}

export interface PdfMessage {
  id: number;
  conversationId: number;
  content: string;
  role: "USER" | "ASSISTANT";
  createdAt: Date;
}

export interface PdfDocument {
  id: number;
  conversationId: number;
  originalFileName: string;
  filePath: string;
  fileSize: number;
  contentType: string;
  uploadedAt: Date;
}

export interface PdfUploadResult {
  success: boolean;
  message: string;
  conversation?: PdfConversation;
  pdfDocument?: PdfDocument;
  error?: string;
}

export interface PythonPdfUploadResult {
  file_id: string;
  filename: string;
  file_size: number;
  text_length: number;
  message: string;
  timestamp: string;
}

export interface PdfSummaryResult {
  summary: string;
  original_length: number;
  summary_length: number;
  model_used: string;
  processing_time: number;
  timestamp: string;
}

// PDF Q/A entities for Python backend
export interface PdfQARequest {
  file_id: string;
  question: string;
  top_k?: number;
}

export interface PdfQAResponse {
  answer?: string;
  answers?: string[];
  text?: string;
  processing_time?: number;
  model_used?: string;
  timestamp?: string;
  [key: string]: unknown; // Allow other fields from API
}
