import { Message, ChatConversation } from '../../domain/entities';
import { ChatRepository } from '../../domain/interfaces/repositories';

export class SendMessageUseCase {
  constructor(private chatRepository: ChatRepository) {}

  async execute(conversationId: string, content: string, role: 'USER' | 'ASSISTANT'): Promise<Message> {
    return this.chatRepository.sendMessage(conversationId, content, role);
  }
}

export class GetConversationHistoryUseCase {
  constructor(private chatRepository: ChatRepository) {}

  async execute(conversationId: string): Promise<Message[]> {
    return this.chatRepository.getMessages(conversationId);
  }
}

export class GetConversationsUseCase {
  constructor(private chatRepository: ChatRepository) {}

  async execute(): Promise<ChatConversation[]> {
    return this.chatRepository.getConversations();
  }
}

export class CreateConversationUseCase {
  constructor(private chatRepository: ChatRepository) {}

  async execute(title: string): Promise<ChatConversation> {
    return this.chatRepository.createConversation(title);
  }
}
