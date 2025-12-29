import type { UserRole } from "./user";
import type { PostCategoryDto } from "./post";

// Admin entities
export interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
  isEnabled: boolean;
  avatar?: string;
  lawyerLicenseNumber?: string;
  lawyerVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  category: PostCategoryDto;
  author: {
    id: number;
    name: string;
    email: string;
  };
  isActive: boolean;
  views: number;
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalLawyers: number;
  totalPosts: number;
  pendingLawyerApplications: number;
  usersToday: number;
  lawyerApplicationsToday: number;
  postsToday: number;
  activeConversations: number;
}
