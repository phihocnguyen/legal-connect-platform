export interface Message {
  id: string;
  content: string;
  role: "USER" | "ASSISTANT";
  createdAt: Date;
}

export interface ChatConversation {
  id: string;
  type?: "PDF_QA" | "QA";
  title: string;
  messages: Message[];
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatQARequest {
  question: string;
  top_k?: number;
  conversation_id?: string;
  chat_history?: Array<{
    role: string;
    content: string;
  }>;
}

export interface ChatQAResponse {
  success: boolean;
  answer: string;
  sources?: Array<{
    content: string;
    metadata: Record<string, any>;
  }>;
  processing_time?: number;
  model_used?: string;
  timestamp?: string;
  error?: string;
}
