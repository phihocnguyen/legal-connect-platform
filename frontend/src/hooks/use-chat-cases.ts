import { useCallback } from 'react';
import { container } from '../infrastructure/container';
import {
  SendMessageUseCase,
  GetConversationHistoryUseCase,
  GetConversationsUseCase,
  CreateConversationUseCase,
  UpdateConversationTitleUseCase,
  DeleteConversationUseCase,
} from '../application/use-cases/chat.use-case';

export function useChatUseCases() {
  const sendMessage = useCallback(
    (conversationId: string, content: string, role: 'USER' | 'ASSISTANT') => {
      const useCase = container.getUseCase<SendMessageUseCase>('SendMessageUseCase');
      return useCase.execute(conversationId, content, role);
    },
    []
  );

  const getConversationHistory = useCallback((conversationId: string) => {
    const useCase = container.getUseCase<GetConversationHistoryUseCase>(
      'GetConversationHistoryUseCase'
    );
    return useCase.execute(conversationId);
  }, []);

  const getConversations = useCallback(() => {
    const useCase = container.getUseCase<GetConversationsUseCase>(
      'GetConversationsUseCase'
    );
    return useCase.execute();
  }, []);

  const createConversation = useCallback((title: string) => {
    const useCase = container.getUseCase<CreateConversationUseCase>(
      'CreateConversationUseCase'
    );
    return useCase.execute(title);
  }, []);

  const updateConversationTitle = useCallback((id: string, title: string) => {
    const useCase = container.getUseCase<UpdateConversationTitleUseCase>(
      'UpdateConversationTitleUseCase'
    );
    return useCase.execute(id, title);
  }, []);

  const deleteConversation = useCallback((id: string) => {
    const useCase = container.getUseCase<DeleteConversationUseCase>(
      'DeleteConversationUseCase'
    );
    return useCase.execute(id);
  }, []);

  return {
    sendMessage,
    getConversationHistory,
    getConversations,
    createConversation,
    updateConversationTitle,
    deleteConversation,
  };
}
