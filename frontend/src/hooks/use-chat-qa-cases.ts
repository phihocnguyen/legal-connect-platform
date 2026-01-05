import { useCallback } from 'react';
import { container } from '@/infrastructure/container';
import { AskQuestionUseCase } from '@/application/use-cases/chat-qa.use-case';
import { ChatQAResponse } from '@/domain/entities';

export const useChatQAUseCases = () => {
  const askQuestionUseCase = container.getUseCase<AskQuestionUseCase>('AskQuestionUseCase');

  const askQuestion = useCallback(
    async (
      question: string, 
      topK?: number,
      conversationId?: string,
      chatHistory?: Array<{ role: string; content: string }>
    ): Promise<ChatQAResponse> => {
      return askQuestionUseCase.execute(question, topK, conversationId, chatHistory);
    },
    [askQuestionUseCase]
  );

  return {
    askQuestion,
  };
};
