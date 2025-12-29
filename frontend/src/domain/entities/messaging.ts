import type { UserRole } from "./user";

// Messaging entities for user-to-user messages
export interface UserMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  senderAvatar?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserConversation {
  id: number;
  participant: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    role: UserRole;
    online: boolean;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: number;
  };
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}
