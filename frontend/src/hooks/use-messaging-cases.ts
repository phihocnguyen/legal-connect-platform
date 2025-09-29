import { useCallback } from 'react';
import { container } from '../infrastructure/container';
import {
  GetConversationsUseCase,
  GetConversationMessagesUseCase,
  SendMessageUseCase,
  CreateConversationUseCase,
  GetOrCreateConversationUseCase,
  MarkMessagesAsReadUseCase,
} from '../application/use-cases/messaging.use-case';

export function useMessagingUseCases() {
  const getConversations = useCallback((userId: number) => {
    const useCase = container.getUseCase<GetConversationsUseCase>('MessagingGetConversationsUseCase');
    return useCase.execute(userId);
  }, []);

  const getConversationMessages = useCallback((conversationId: string) => {
    const useCase = container.getUseCase<GetConversationMessagesUseCase>('GetConversationMessagesUseCase');
    return useCase.execute(conversationId);
  }, []);

  const sendMessage = useCallback((conversationId: string, content: string, senderId: number) => {
    const useCase = container.getUseCase<SendMessageUseCase>('MessagingSendMessageUseCase');
    return useCase.execute(conversationId, content, senderId);
  }, []);

  const createConversation = useCallback((user1Id: number, user2Id: number) => {
    const useCase = container.getUseCase<CreateConversationUseCase>('MessagingCreateConversationUseCase');
    return useCase.execute(user1Id, user2Id);
  }, []);

  const getOrCreateConversation = useCallback((user1Id: number, user2Id: number) => {
    const useCase = container.getUseCase<GetOrCreateConversationUseCase>('GetOrCreateConversationUseCase');
    return useCase.execute(user1Id, user2Id);
  }, []);

  const markMessagesAsRead = useCallback((conversationId: string, userId: number) => {
    const useCase = container.getUseCase<MarkMessagesAsReadUseCase>('MarkMessagesAsReadUseCase');
    return useCase.execute(conversationId, userId);
  }, []);

  return {
    getConversations,
    getConversationMessages,
    sendMessage,
    createConversation,
    getOrCreateConversation,
    markMessagesAsRead,
  };
}