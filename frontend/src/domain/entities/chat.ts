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

// Chat Q/A entities for Python backend
export interface ChatQARequest {
  question: string;
  top_k?: number;
}

export interface ChatQAResponse {
  answer: string;
  processing_time: number;
  model_used: string;
  timestamp: string;
}
