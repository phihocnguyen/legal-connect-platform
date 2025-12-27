import type { User } from "./user";

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
