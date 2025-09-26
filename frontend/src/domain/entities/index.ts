export interface User {
  id: number;
  email: string;
  fullName: string;
  avatar?: string;
  role: UserRole;
  lawyerLicenseNumber?: string;
  lawyerVerified: boolean;
}

export type UserRole = 'user' | 'lawyer' | 'admin';

// Forum Post interfaces matching backend DTOs
export interface PostDto {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  categoryId: number;
  categoryName: string;
  categorySlug: string;
  viewCount: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PostCreateDto {
  title: string;
  content: string;
  categoryId: number;
}

export interface PostCategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  postCount?: number;
}

export interface PostReplyDto {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  postId: number;
  parentId?: number;
  createdAt: string;
  updatedAt: string;
  children?: PostReplyDto[];
}

export interface AddReplyDto {
  content: string;
  parentId?: number;
}

// Keep legacy interfaces for compatibility
export interface Post {
  id: number;
  title: string;
  content: string;
  author: User;
  category: Category;
  tags: string[];
  viewCount: number;
  votes: number;
  isSolved: boolean;
  createdAt: Date;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  createdAt: Date;
  isAnswer: boolean;
  votes: number;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;
}

export interface ChatConversation {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PdfConversation {
  id: number;
  userId: number;
  type: 'PDF_QA' | 'QA';
  title: string;
  summary?: string;
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
  role: 'USER' | 'ASSISTANT';
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
