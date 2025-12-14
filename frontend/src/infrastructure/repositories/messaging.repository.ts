import { MessagingRepository } from "../../domain/interfaces/repositories";
import { UserConversation, UserMessage } from "../../domain/entities";
import { apiClient } from "@/lib/axiosInstance";

export class MessagingRepositoryImpl implements MessagingRepository {
  async getConversations(_userId: number): Promise<UserConversation[]> {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    const response = await apiClient.get("/user-conversations");
    return response.data as UserConversation[];
  }

  async getConversationMessages(
    conversationId: string
  ): Promise<UserMessage[]> {
    const response = await apiClient.get(
      `/user-conversations/${conversationId}/messages`
    );
    return response.data as UserMessage[];
  }

  async sendMessage(
    conversationId: string,
    content: string,
    _senderId: number
  ): Promise<UserMessage> {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    const response = await apiClient.post("/user-conversations/messages", {
      conversationId: parseInt(conversationId),
      content,
    });
    return response.data as UserMessage;
  }

  async createConversation(
    user1Id: number,
    user2Id: number
  ): Promise<UserConversation> {
    const response = await apiClient.post("/user-conversations", {
      otherUserId: user2Id,
    });
    return response.data as UserConversation;
  }

  async getOrCreateConversation(
    user1Id: number,
    user2Id: number
  ): Promise<UserConversation> {
    const response = await apiClient.post(
      `/user-conversations/get-or-create?otherUserId=${user2Id}`
    );
    return response.data as UserConversation;
  }

  async markMessagesAsRead(
    conversationId: string,
    _userId: number
  ): Promise<void> {
    // eslint-disable-line @typescript-eslint/no-unused-vars
    await apiClient.put(`/user-conversations/${conversationId}/read`);
  }
}
