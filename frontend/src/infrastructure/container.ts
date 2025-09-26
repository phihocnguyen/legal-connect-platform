import { ChatRepository, AuthRepository, PostRepository, PdfRepository } from '../domain/interfaces/repositories';
import { HttpChatRepository } from './repositories/chat.repository';
import { HttpAuthRepository } from './repositories/auth.repository';
import { HttpPostRepository } from './repositories/post.repository';
import { HttpPdfRepository } from './repositories/pdf.repository';

import {
  SendMessageUseCase,
  GetConversationHistoryUseCase,
  CreateConversationUseCase,
} from '../application/use-cases/chat.use-case';
import {
  LoginUseCase,
  RegisterUseCase,
  LogoutUseCase,
  GetCurrentUserUseCase,
} from '../application/use-cases/auth.use-case';
import {
  CreatePostUseCase,
  GetPostsUseCase,
  VotePostUseCase,
  GetAllCategoriesUseCase,
  GetCategoryBySlugUseCase,
  GetAllPostsUseCase,
  GetPostsByCategoryUseCase,
  SearchPostsUseCase,
  SearchPostsByCategoryUseCase,
  GetPostByIdUseCase,
  CreatePostNewUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  GetRepliesByPostUseCase,
  AddReplyUseCase,
  DeleteReplyUseCase,
} from '../application/use-cases/post.use-case';
import { 
  UploadPdfUseCase, 
  GetConversationsUseCase, 
  GetConversationUseCase,
  GetConversationWithDetailsUseCase,
  SendMessageUseCase as PdfSendMessageUseCase,
  GetMessagesUseCase,
  DeleteConversationUseCase,
  UploadPdfToPythonUseCase,
  GetPdfSummaryUseCase,
} from '../application/use-cases/pdf.use-case';class Container {
  private static instance: Container;
  private repositories: Map<string, ChatRepository | AuthRepository | PostRepository | PdfRepository> = new Map();
  private useCases: Map<string, unknown> = new Map();

  private constructor() {
    this.registerRepositories();
    this.registerUseCases();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private registerRepositories() {
    const chatRepo = new HttpChatRepository();
    const authRepo = new HttpAuthRepository();
    const postRepo = new HttpPostRepository();
    const pdfRepo = new HttpPdfRepository();

    this.repositories.set('ChatRepository', chatRepo);
    this.repositories.set('AuthRepository', authRepo);
    this.repositories.set('PostRepository', postRepo);
    this.repositories.set('PdfRepository', pdfRepo);
  }

  private registerUseCases() {
    const chatRepo = this.repositories.get('ChatRepository') as ChatRepository;
    const authRepo = this.repositories.get('AuthRepository') as AuthRepository;
    const postRepo = this.repositories.get('PostRepository') as PostRepository;
    const pdfRepo = this.repositories.get('PdfRepository') as PdfRepository;

    // Chat use cases
    this.useCases.set(
      'SendMessageUseCase',
      new SendMessageUseCase(chatRepo)
    );
    this.useCases.set(
      'GetConversationHistoryUseCase',
      new GetConversationHistoryUseCase(chatRepo)
    );
    this.useCases.set(
      'CreateConversationUseCase',
      new CreateConversationUseCase(chatRepo)
    );

    // Auth use cases
    this.useCases.set(
      'LoginUseCase',
      new LoginUseCase(authRepo)
    );
    this.useCases.set(
      'RegisterUseCase',
      new RegisterUseCase(authRepo)
    );
    this.useCases.set(
      'LogoutUseCase',
      new LogoutUseCase(authRepo)
    );
    this.useCases.set(
      'GetCurrentUserUseCase',
      new GetCurrentUserUseCase(authRepo)
    );

    // Post use cases
    this.useCases.set(
      'CreatePostUseCase',
      new CreatePostUseCase(postRepo)
    );
    this.useCases.set(
      'GetPostsUseCase',
      new GetPostsUseCase(postRepo)
    );
    this.useCases.set(
      'VotePostUseCase',
      new VotePostUseCase(postRepo)
    );

    // New Forum use cases
    this.useCases.set(
      'GetAllCategoriesUseCase',
      new GetAllCategoriesUseCase(postRepo)
    );
    this.useCases.set(
      'GetCategoryBySlugUseCase',
      new GetCategoryBySlugUseCase(postRepo)
    );
    this.useCases.set(
      'GetAllPostsUseCase',
      new GetAllPostsUseCase(postRepo)
    );
    this.useCases.set(
      'GetPostsByCategoryUseCase',
      new GetPostsByCategoryUseCase(postRepo)
    );
    this.useCases.set(
      'SearchPostsUseCase',
      new SearchPostsUseCase(postRepo)
    );
    this.useCases.set(
      'SearchPostsByCategoryUseCase',
      new SearchPostsByCategoryUseCase(postRepo)
    );
    this.useCases.set(
      'GetPostByIdUseCase',
      new GetPostByIdUseCase(postRepo)
    );
    this.useCases.set(
      'CreatePostNewUseCase',
      new CreatePostNewUseCase(postRepo)
    );
    this.useCases.set(
      'UpdatePostUseCase',
      new UpdatePostUseCase(postRepo)
    );
    this.useCases.set(
      'DeletePostUseCase',
      new DeletePostUseCase(postRepo)
    );
    this.useCases.set(
      'GetRepliesByPostUseCase',
      new GetRepliesByPostUseCase(postRepo)
    );
    this.useCases.set(
      'AddReplyUseCase',
      new AddReplyUseCase(postRepo)
    );
    this.useCases.set(
      'DeleteReplyUseCase',
      new DeleteReplyUseCase(postRepo)
    );

    // PDF use cases
    this.useCases.set(
      'UploadPdfUseCase',
      new UploadPdfUseCase(pdfRepo)
    );
    this.useCases.set(
      'GetPdfConversationsUseCase',
      new GetConversationsUseCase(pdfRepo)
    );
    this.useCases.set(
      'GetPdfConversationUseCase',
      new GetConversationUseCase(pdfRepo)
    );
    this.useCases.set(
      'GetPdfConversationWithDetailsUseCase',
      new GetConversationWithDetailsUseCase(pdfRepo)
    );
    this.useCases.set(
      'SendPdfMessageUseCase',
      new PdfSendMessageUseCase(pdfRepo)
    );
    this.useCases.set(
      'GetPdfMessagesUseCase',
      new GetMessagesUseCase(pdfRepo)
    );
    this.useCases.set(
      'DeletePdfConversationUseCase',
      new DeleteConversationUseCase(pdfRepo)
    );
    
    // Python API Use Cases
    this.useCases.set(
      'UploadPdfToPythonUseCase',
      new UploadPdfToPythonUseCase(pdfRepo)
    );
    this.useCases.set(
      'GetPdfSummaryUseCase',
      new GetPdfSummaryUseCase(pdfRepo)
    );
  }

  getRepository<T>(name: string): T {
    const repository = this.repositories.get(name);
    if (!repository) {
      throw new Error(`Repository ${name} not found`);
    }
    return repository as T;
  }

  getUseCase<T>(name: string): T {
    const useCase = this.useCases.get(name);
    if (!useCase) {
      throw new Error(`Use case ${name} not found`);
    }
    return useCase as T;
  }
}

export const container = Container.getInstance();
