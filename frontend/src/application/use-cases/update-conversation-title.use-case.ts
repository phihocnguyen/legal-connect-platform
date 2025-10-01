import { ChatRepository } from '@/domain/interfaces/repositories';
import { ChatConversation } from '@/domain/entities';

export class UpdateConversationTitleUseCase {
  constructor(private chatRepository: ChatRepository) {}

  async execute(id: string, title: string): Promise<ChatConversation> {
    if (!title || title.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    if (title.trim().length < 3) {
      throw new Error('Title must be at least 3 characters');
    }

    if (title.trim().length > 100) {
      throw new Error('Title must not exceed 100 characters');
    }

    return await this.chatRepository.updateConversationTitle(id, title.trim());
  }
}
