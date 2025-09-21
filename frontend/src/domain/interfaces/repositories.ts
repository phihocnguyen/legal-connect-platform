import { 
  User, 
  ChatConversation, 
  Message, 
  Post, 
  PdfConversation, 
  PdfMessage, 
  PdfUploadResult,
  PythonPdfUploadResult,
  PdfSummaryResult
} from '../entities';

export interface ChatRepository {
  getConversations(): Promise<ChatConversation[]>;
  getConversation(id: string): Promise<ChatConversation>;
  createConversation(title: string): Promise<ChatConversation>;
  deleteConversation(id: string): Promise<void>;
  sendMessage(conversationId: string, content: string): Promise<Message>;
}

export interface AuthRepository {
  login(email: string, password: string): Promise<{ user: User }>;
  register(userData: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ user: User }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
}

export interface PostRepository {
  getPosts(params: {
    category?: string;
    page?: number;
    limit?: number;
    tag?: string;
  }): Promise<{
    posts: Post[];
    total: number;
  }>;
  getPost(id: string): Promise<Post>;
  createPost(data: {
    title: string;
    content: string;
    categoryId: number;
    tags: string[];
  }): Promise<Post>;
  updatePost(id: string, data: Partial<Post>): Promise<Post>;
  deletePost(id: string): Promise<void>;
  votePost(id: string, voteType: 1 | -1): Promise<Post>;
}

export interface PdfRepository {
  uploadPdf(file: File, title: string): Promise<PdfUploadResult>;
  getConversations(): Promise<PdfConversation[]>;
  getConversation(id: number): Promise<PdfConversation>;
  getConversationWithDetails(id: number): Promise<PdfConversation>;
  sendMessage(conversationId: number, content: string): Promise<PdfMessage>;
  getMessages(conversationId: number): Promise<PdfMessage[]>;
  updateConversationTitle(id: number, title: string): Promise<PdfConversation>;
  deleteConversation(id: number): Promise<void>;
  getPdfViewUrl(conversationId: number): string;
  getPdfDownloadUrl(conversationId: number): string;
  
  // Python API methods
  uploadPdfToPython(file: File): Promise<PythonPdfUploadResult>;
  getPdfSummary(fileId: string, maxLength?: number): Promise<PdfSummaryResult>;
}
