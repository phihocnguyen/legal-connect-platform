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


export interface PostDto {
  id: number;
  title: string;
  content: string;
  category: {
    id: number;
    slug: string;
    name: string;
    description?: string;
    icon: string;
    displayOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    threadsCount?: number;
    postsCount?: number;
    lastPost: {
      id: number;
      title: string;
      authorName: string;
      authorRole: UserRole;
      createdAt: string;
    }
  }
  author: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  }
  views: number;
  replyCount: number;
  pinned: boolean;
  solved: boolean;
  isHot: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastReply?: null 
  lastReplyAt?: string;
  replies: PostReplyDto[];
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
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  threadsCount?: number;
  postsCount?: number;
}

export interface PostReplyDto {
  id: number;
  content: string;
  postId: number;
  author: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar: string;
  }
  parentId?: number;
  isActive: boolean;
  isSolution: boolean;
  createdAt: string;
  updatedAt: string;
  isTopLevel: boolean;
  children?: PostReplyDto[];
}

export interface AddReplyDto {
  content: string;
  parentId?: number;
}

// Forum Statistics DTOs
export interface ForumStatsDto {
  totalTopics: number;
  totalPosts: number;
  totalMembers: number;
  topicsToday: number;
  postsToday: number;
  membersToday: number;
}

export interface PopularTopicDto {
  id: number;
  title: string;
  categoryName: string;
  categorySlug: string;
  views: number;
  replyCount: number;
  badge?: 'hot' | 'solved' | 'trending' | null;
}

export interface CategoryStatsDto {
  id: number;
  name: string;
  slug: string;
  icon?: string;
  topicCount: number;
  totalPostCount: number;
  topicsToday: number;
}

export interface PopularTagDto {
  tag: string;
  count: number;
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
  role: 'USER' | 'ASSISTANT';
  createdAt: Date;
}

export interface ChatConversation {
  id: string;
  type?: 'PDF_QA' | 'QA';
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

// Messaging entities for user-to-user messages
export interface UserMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserConversation {
  id: number;
  participant: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
    online: boolean;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: number;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
