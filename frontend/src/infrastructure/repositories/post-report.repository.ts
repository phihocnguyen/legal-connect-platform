import { apiClient } from "@/lib/axiosInstance";

export interface PostReportCreateRequest {
  reason: string;
  description?: string;
}

export interface PostReportResponse {
  id: number;
  postId: number;
  postTitle: string;
  reporter: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  reason: string;
  description?: string;
  status: string;
  reviewedBy?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  reviewedAt?: string;
  reviewNote?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export class PostReportRepository {
  
  async createReport(postId: number, request: PostReportCreateRequest): Promise<PostReportResponse> {
    const response = await apiClient.post<ApiResponse<PostReportResponse>>(
      `/posts/${postId}/reports`,
      request
    );
    return response.data.data;
  }
  
  async checkUserReported(postId: number): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `/posts/${postId}/reports/check`
    );
    return response.data.data;
  }
  
  async getUserReports(): Promise<PostReportResponse[]> {
    const response = await apiClient.get<ApiResponse<PostReportResponse[]>>(
      '/user/reports'
    );
    return response.data.data;
  }
  
  // Admin methods
  async getAllReports(page: number = 0, size: number = 20): Promise<{
    content: PostReportResponse[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<ApiResponse<{
      content: PostReportResponse[];
      totalElements: number;
      totalPages: number;
    }>>(
      '/admin/reports',
      { params: { page, size } }
    );
    return response.data.data;
  }
  
  async getReportsByStatus(status: string): Promise<PostReportResponse[]> {
    const response = await apiClient.get<ApiResponse<PostReportResponse[]>>(
      `/admin/reports/status/${status}`
    );
    return response.data.data;
  }
  
  async getReportById(reportId: number): Promise<PostReportResponse> {
    const response = await apiClient.get<ApiResponse<PostReportResponse>>(
      `/admin/reports/${reportId}`
    );
    return response.data.data;
  }
  
  async updateReportStatus(
    reportId: number, 
    status: string, 
    reviewNote?: string
  ): Promise<PostReportResponse> {
    const response = await apiClient.put<ApiResponse<PostReportResponse>>(
      `/admin/reports/${reportId}/status`,
      null,
      { params: { status, reviewNote } }
    );
    return response.data.data;
  }
  
  async countPendingReports(): Promise<number> {
    const response = await apiClient.get<ApiResponse<number>>(
      '/admin/reports/count/pending'
    );
    return response.data.data;
  }
  
  async getReportsByPostId(postId: number): Promise<PostReportResponse[]> {
    const response = await apiClient.get<ApiResponse<PostReportResponse[]>>(
      `/api/admin/posts/${postId}/reports`
    );
    return response.data.data;
  }
}

export const postReportRepository = new PostReportRepository();

