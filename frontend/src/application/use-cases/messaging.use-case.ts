import { MessagingRepository } from '../../domain/interfaces/repositories';
import { UserConversation, UserMessage } from '../../domain/entities';

export class GetConversationsUseCase {
  constructor(private messagingRepository: MessagingRepository) {}

  async execute(userId: number): Promise<UserConversation[]> {
    return await this.messagingRepository.getConversations(userId);
  }
}

export class GetConversationMessagesUseCase {
  constructor(private messagingRepository: MessagingRepository) {}

  async execute(conversationId: string): Promise<UserMessage[]> {
    return await this.messagingRepository.getConversationMessages(conversationId);
  }
}

export class SendMessageUseCase {
  constructor(private messagingRepository: MessagingRepository) {}

  async execute(conversationId: string, content: string, senderId: number): Promise<UserMessage> {
    return await this.messagingRepository.sendMessage(conversationId, content, senderId);
  }
}

export class CreateConversationUseCase {
  constructor(private messagingRepository: MessagingRepository) {}

  async execute(user1Id: number, user2Id: number): Promise<UserConversation> {
    return await this.messagingRepository.createConversation(user1Id, user2Id);
  }
}

export class GetOrCreateConversationUseCase {
  constructor(private messagingRepository: MessagingRepository) {}

  async execute(user1Id: number, user2Id: number): Promise<UserConversation> {
    return await this.messagingRepository.getOrCreateConversation(user1Id, user2Id);
  }
}

export class MarkMessagesAsReadUseCase {
  constructor(private messagingRepository: MessagingRepository) {}

  async execute(conversationId: string, userId: number): Promise<void> {
    return await this.messagingRepository.markMessagesAsRead(conversationId, userId);
  }
}