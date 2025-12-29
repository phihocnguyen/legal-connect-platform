// User entities
export type { User, UserRole, UserProfile, UserPost, ApiKey } from "./user";

// Post entities
export type {
  PostDto,
  PostCreateDto,
  PostLabelDto,
  PostCategoryDto,
  PostReplyDto,
  AddReplyDto,
} from "./post";

// Forum entities
export type {
  ForumStatsDto,
  PopularTopicDto,
  CategoryStatsDto,
  PopularTagDto,
} from "./forum";

// Chat entities
export type {
  Message,
  ChatConversation,
  ChatQARequest,
  ChatQAResponse,
} from "./chat";

// PDF entities
export type {
  PdfConversation,
  PdfMessage,
  PdfDocument,
  PdfUploadResult,
  PythonPdfUploadResult,
  PdfSummaryResult,
  PdfQARequest,
  PdfQAResponse,
} from "./pdf";

// Messaging entities
export type { UserMessage, UserConversation } from "./messaging";

// Admin entities
export type { AdminUser, AdminPost, AdminDashboardStats } from "./admin";

// Lawyer entities
export type { LawyerApplication } from "./lawyer";

// Notification entities
export type { NotificationDto } from "./notification";

// Vote entities
export type { VoteDto } from "./vote";

// Legacy entities (for compatibility)
export type { Post, Category, Comment } from "./legacy";
