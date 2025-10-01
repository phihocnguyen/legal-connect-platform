import { ChatQARepository } from '../../domain/interfaces/repositories';
import { ChatQARequest, ChatQAResponse } from '../../domain/entities';

export class AskQuestionUseCase {
  constructor(private chatQARepository: ChatQARepository) {}

  async execute(question: string, topK?: number): Promise<ChatQAResponse> {
    const request: ChatQARequest = {
      question,
      top_k: topK || 5
    };
    
    return this.chatQARepository.askQuestion(request);
  }
}
