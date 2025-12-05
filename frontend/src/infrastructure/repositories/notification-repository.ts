import axiosInstance, { apiClient } from '@/lib/axiosInstance';
import { NotificationDto } from '@/domain/entities';

export interface NotificationPage {
  content: NotificationDto[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export class NotificationRepository {
  async getNotifications(
    page: number = 0,
    size: number = 20,
    unreadOnly?: boolean
  ): Promise<NotificationPage> {
    const params: Record<string, string | boolean> = { page: page.toString(), size: size.toString() };
    if (unreadOnly !== undefined) {
      params.unreadOnly = unreadOnly;
    }
    
    const response = await apiClient.get<NotificationPage>('/notifications', {
      params
    });
    return response.data;
  }

  async markAsRead(notificationId: number): Promise<NotificationDto> {
    const response = await apiClient.put<NotificationDto>(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  }

  async markAllAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  }

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<number>('/notifications/unread-count');
    return response.data;
  }
}

export const notificationRepository = new NotificationRepository();

