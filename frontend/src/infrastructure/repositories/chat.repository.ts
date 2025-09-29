import { ChatRepository } from '../../domain/interfaces/repositories';
import { Message, ChatConversation } from '../../domain/entities';
import { apiClient } from '@/lib/axiosInstance';

// This repository uses the existing AI chatbot APIs
// Endpoints: /api/conversations (for AI chat, not user-to-user)

export class HttpChatRepository implements ChatRepository {

  async getConversations(): Promise<ChatConversation[]> {
    try {
      const response = await apiClient.get('/conversations');
      return response.data as ChatConversation[];
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  async getConversation(id: string): Promise<ChatConversation> {
    try {
      const response = await apiClient.get(`/conversations/${id}`);
      return response.data as ChatConversation;
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      throw new Error('Failed to fetch conversation');
    }
  }

  async createConversation(title: string): Promise<ChatConversation> {
    try {
      const response = await apiClient.post('/conversations', {
        title,
      });
      return response.data as ChatConversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  async deleteConversation(id: string): Promise<void> {
    try {
      await apiClient.delete(`/conversations/${id}`);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    try {
      const response = await apiClient.post(`/conversations/${conversationId}/messages`, {
        content,
      });
      return response.data as Message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }
}
