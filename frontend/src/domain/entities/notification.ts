export interface NotificationDto {
  id: number;
  userId: number;
  message: string;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}
