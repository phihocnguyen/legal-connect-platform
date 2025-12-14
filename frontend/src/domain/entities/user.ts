export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  avatar: string | null;
  role: string;
  phoneNumber: string | null;
  lawyerVerified: boolean;
  postCount: number;
  replyCount: number;
  joinedAt: string;
}

export interface UserPost {
  id: number;
  title: string;
  content: string;
  categoryName: string;
  categorySlug: string;
  views: number;
  replyCount: number;
  pinned: boolean;
  solved: boolean;
  isHot: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiKey {
  id: number;
  key: string;
  totalLimit: number;
  usedCount: number;
  pdfQaCount: number;
  chatQaCount: number;
  remainingCalls: number;
  isActive: boolean;
  createdAt: string;
  expiresAt: string;
}
