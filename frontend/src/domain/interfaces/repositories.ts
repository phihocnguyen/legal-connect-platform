import { ChatConversation, Message, Post, User } from '../entities';

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
