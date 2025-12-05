import { 
  PostReportRepository, 
  PostReportCreateRequest, 
  PostReportResponse 
} from '@/infrastructure/repositories/post-report.repository';

export class PostReportUseCases {
  constructor(private repository: PostReportRepository) {}

  async createReport(postId: number, request: PostReportCreateRequest): Promise<PostReportResponse> {
    return await this.repository.createReport(postId, request);
  }

  async checkUserReported(postId: number): Promise<boolean> {
    return await this.repository.checkUserReported(postId);
  }

  async getUserReports(): Promise<PostReportResponse[]> {
    return await this.repository.getUserReports();
  }

  // Admin methods
  async getAllReports(page: number = 0, size: number = 20) {
    return await this.repository.getAllReports(page, size);
  }

  async getReportsByStatus(status: string): Promise<PostReportResponse[]> {
    return await this.repository.getReportsByStatus(status);
  }

  async getReportById(reportId: number): Promise<PostReportResponse> {
    return await this.repository.getReportById(reportId);
  }

  async updateReportStatus(
    reportId: number, 
    status: string, 
    reviewNote?: string
  ): Promise<PostReportResponse> {
    return await this.repository.updateReportStatus(reportId, status, reviewNote);
  }

  async countPendingReports(): Promise<number> {
    return await this.repository.countPendingReports();
  }

  async getReportsByPostId(postId: number): Promise<PostReportResponse[]> {
    return await this.repository.getReportsByPostId(postId);
  }
}

