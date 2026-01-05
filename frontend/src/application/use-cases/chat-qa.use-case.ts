import { ChatQARepository } from '../../domain/interfaces/repositories';
import { ChatQARequest, ChatQAResponse } from '../../domain/entities';

export class AskQuestionUseCase {
  constructor(private chatQARepository: ChatQARepository) {}

  async execute(
    question: string, 
    topK?: number,
    conversationId?: string,
    chatHistory?: Array<{ role: string; content: string }>
  ): Promise<ChatQAResponse> {
    const request: ChatQARequest = {
      question,
      top_k: topK || 5,
      conversation_id: conversationId,
      chat_history: chatHistory
    };
    
    return this.chatQARepository.askQuestion(request);
  }
}
