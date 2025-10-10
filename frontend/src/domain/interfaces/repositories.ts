import { 
  User, 
  AdminUser,
  ChatConversation, 
  Message, 
  Post, 
  PostDto,
  PostCreateDto,
  PostCategoryDto,
  PostReplyDto,
  AddReplyDto,
  PdfConversation, 
  PdfMessage, 
  PdfUploadResult,
  PythonPdfUploadResult,
  PdfSummaryResult,
  UserMessage,
  UserConversation,
  ForumStatsDto,
  PopularTopicDto,
  CategoryStatsDto,
  PopularTagDto,
  ChatQARequest,
  ChatQAResponse,
  LawyerApplication,
  AdminDashboardStats,
  AdminPost
} from '../entities';

export interface ChatRepository {
  getConversations(): Promise<ChatConversation[]>;
  getConversation(id: string): Promise<ChatConversation>;
  getMessages(conversationId: string): Promise<Message[]>;
  createConversation(title: string): Promise<ChatConversation>;
  updateConversationTitle(id: string, title: string): Promise<ChatConversation>;
  deleteConversation(id: string): Promise<void>;
  sendMessage(conversationId: string, content: string, role: 'USER' | 'ASSISTANT'): Promise<Message>;
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
  // Legacy methods for compatibility
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

  // New Forum API methods matching backend
  getAllCategories(): Promise<PostCategoryDto[]>;
  getCategoryBySlug(slug: string): Promise<PostCategoryDto>;
  
  getAllPosts(params: { page?: number; size?: number; sort?: string }): Promise<{
    content: PostDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>;
  
  getPostsByCategory(
    categorySlug: string, 
    params: { page?: number; size?: number; sort?: string }
  ): Promise<{
    content: PostDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>;
  
  searchPosts(
    keyword: string, 
    params: { page?: number; size?: number; sort?: string }
  ): Promise<{
    content: PostDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>;
  
  searchPostsByCategory(
    keyword: string,
    categorySlug: string, 
    params: { page?: number; size?: number; sort?: string }
  ): Promise<{
    content: PostDto[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
  }>;
  
  getPostById(id: number): Promise<PostDto>;
  createPostNew(data: PostCreateDto): Promise<PostDto>;
  updatePostNew(id: number, data: PostCreateDto): Promise<PostDto>;
  deletePostNew(id: number): Promise<void>;

  // Replies
  getRepliesByPost(postId: number): Promise<PostReplyDto[]>;
  addReply(postId: number, data: AddReplyDto): Promise<PostReplyDto>;
  deleteReply(replyId: number): Promise<void>;
}

export interface PdfRepository {
  uploadPdf(file: File, title: string, summary?: string): Promise<PdfUploadResult>;
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

export interface MessagingRepository {
  getConversations(userId: number): Promise<UserConversation[]>;
  getConversationMessages(conversationId: string): Promise<UserMessage[]>;
  sendMessage(conversationId: string, content: string, senderId: number): Promise<UserMessage>;
  createConversation(user1Id: number, user2Id: number): Promise<UserConversation>;
  getOrCreateConversation(user1Id: number, user2Id: number): Promise<UserConversation>;
  markMessagesAsRead(conversationId: string, userId: number): Promise<void>;
}

export interface ForumRepository {
  getForumStats(): Promise<ForumStatsDto>;
  getPopularTopics(limit: number): Promise<PopularTopicDto[]>;
  getCategoryStats(): Promise<CategoryStatsDto[]>;
  getPopularTags(limit: number): Promise<PopularTagDto[]>;
}

export interface ChatQARepository {
  askQuestion(request: ChatQARequest): Promise<ChatQAResponse>;
}

export interface AdminRepository {
  // User management
  getUsers(params: {
    page?: number;
    size?: number;
    search?: string;
    role?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<{
    content: AdminUser[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }>;
  
  updateUserStatus(userId: number, isEnabled: boolean): Promise<void>;

  // Post moderation
  getPosts(params: {
    page?: number;
    size?: number;
    search?: string;
    isActive?: boolean;
    sortBy?: string;
    sortDir?: string;
  }): Promise<{
    content: AdminPost[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }>;
  
  updatePostStatus(postId: number, isActive: boolean): Promise<void>;

  // Lawyer applications
  getLawyerApplications(params: {
    page?: number;
    size?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortDir?: string;
  }): Promise<{
    content: LawyerApplication[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
  }>;
  
  approveLawyerApplication(applicationId: number, adminNotes?: string): Promise<void>;
  rejectLawyerApplication(applicationId: number, adminNotes?: string): Promise<void>;

  // Dashboard stats
  getDashboardStats(): Promise<AdminDashboardStats>;
}

export interface LawyerRepository {
  uploadDocuments(files: File[]): Promise<string[]>;
  submitApplication(application: {
    licenseNumber: string;
    lawSchool: string;
    graduationYear: number;
    specializations: string[];
    yearsOfExperience: number;
    currentFirm: string;
    bio: string;
    phoneNumber: string;
    officeAddress: string;
    documentUrls: string[];
  }): Promise<LawyerApplication>;
  getUserApplication(): Promise<LawyerApplication | null>;
  canUserApply(): Promise<boolean>;
  hasUserApplied(): Promise<boolean>;
  updateApplicationDocuments(applicationId: number, documentUrls: string[]): Promise<LawyerApplication>;
  deleteApplication(applicationId: number): Promise<void>;
}
