export interface User {
  id: number;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: UserRole;
  lawyerLicenseNumber?: string;
  lawyerVerified: boolean;
}

export type UserRole = 'user' | 'lawyer' | 'admin';

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
