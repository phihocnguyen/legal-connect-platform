import { ChatRepository } from '../../domain/interfaces/repositories';
import { Message, ChatConversation } from '../../domain/entities';
import { apiClient } from '@/lib/axiosInstance';

export class HttpChatRepository implements ChatRepository {

  async getConversations(): Promise<ChatConversation[]> {
    try {
      const response = await apiClient.get('/conversations?type=QA');
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

  async getMessages(conversationId: string): Promise<Message[]> {
    try {
      const response = await apiClient.get(`/conversations/${conversationId}/messages`);
      return response.data as Message[];
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      throw new Error('Failed to fetch messages');
    }
  }

  async createConversation(title: string): Promise<ChatConversation> {
    try {
      const response = await apiClient.post('/conversations', {
        type: 'QA',
        title,
      });
      return response.data as ChatConversation;
    } catch (error) {
      console.error('Failed to create conversation:', error);
      throw new Error('Failed to create conversation');
    }
  }

  async updateConversationTitle(id: string, title: string): Promise<ChatConversation> {
    try {
      const response = await apiClient.put(`/conversations/${id}/title`, { title });
      return response.data as ChatConversation;
    } catch (error) {
      console.error('Failed to update conversation title:', error);
      throw new Error('Failed to update conversation title');
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

  async sendMessage(conversationId: string, content: string, role: 'USER' | 'ASSISTANT'): Promise<Message> {
    try {
      console.log('📤 Sending message:', {
        conversationId,
        conversationIdType: typeof conversationId,
        conversationIdNumber: Number(conversationId),
        content: content.substring(0, 50),
        role
      });

      if (!conversationId) {
        throw new Error('Conversation ID is required');
      }

      const response = await apiClient.post('/conversations/messages', {
        conversationId: Number(conversationId),
        content,
        role,
      });
      
      console.log('✅ Message sent successfully:', response.data);
      return response.data as Message;
    } catch (error: any) {
      console.error('[AXIOS ERROR] POST /conversations/messages:', error.response?.status, error.response?.data);
      console.error('Failed to send message:', error);
      throw new Error('Failed to send message');
    }
  }
}
