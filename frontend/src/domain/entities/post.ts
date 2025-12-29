import type { UserRole } from "./user";

export interface PostDto {
  id: number;
  title: string;
  slug: string;
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
    };
  };
  author: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
  };
  labels?: PostLabelDto[];
  views: number;
  replyCount: number;
  pinned: boolean;
  solved: boolean;
  isHot: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  lastReply?: null;
  lastReplyAt?: string;
  replies: PostReplyDto[];
}

export interface PostCreateDto {
  title: string;
  content: string;
  categoryId: number;
  labelIds?: string[]; // Changed to string[]
}

export interface PostLabelDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  isActive: boolean;
  categoryId?: string; // Category ID as string
  createdAt: string;
  updatedAt: string;
}

export interface PostCategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  labels?: PostLabelDto[]; // Include labels in category
  createdAt: string;
  updatedAt: string;
  threadsCount?: number;
  postsCount?: number;
  lastPost?: {
    id: number;
    title: string;
    slug: string;
    authorName: string;
    authorRole: string;
    authorAvatar?: string;
    views?: number;
    createdAt: string;
  };
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
  };
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
