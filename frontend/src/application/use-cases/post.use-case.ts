import {
  Post,
  PostDto,
  PostCreateDto,
  PostCategoryDto,
  PostReplyDto,
  AddReplyDto,
} from "../../domain/entities";
import { PostRepository } from "../../domain/interfaces/repositories";

export class CreatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(data: {
    title: string;
    content: string;
    categoryId: number;
    tags: string[];
  }): Promise<Post> {
    return this.postRepository.createPost(data);
  }
}

export class GetPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(params: {
    category?: string;
    page?: number;
    limit?: number;
    tag?: string;
  }): Promise<{ posts: Post[]; total: number }> {
    return this.postRepository.getPosts(params);
  }
}

export class VotePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(postId: string, voteType: 1 | -1): Promise<Post> {
    return this.postRepository.votePost(postId, voteType);
  }
}

// New Forum Use Cases
export class GetAllCategoriesUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(): Promise<PostCategoryDto[]> {
    return this.postRepository.getAllCategories();
  }
}

export class GetCategoryBySlugUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(slug: string): Promise<PostCategoryDto> {
    return this.postRepository.getCategoryBySlug(slug);
  }
}

export class GetAllPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(params: {
    page?: number;
    size?: number;
    sort?: string;
    categoryId?: number;
    timeFilter?: string;
  }) {
    return this.postRepository.getAllPosts(params);
  }
}

export class GetPostsByCategoryUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(
    categorySlug: string,
    params: { page?: number; size?: number; sort?: string }
  ) {
    return this.postRepository.getPostsByCategory(categorySlug, params);
  }
}

export class SearchPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(
    keyword: string,
    params: { page?: number; size?: number; sort?: string }
  ) {
    return this.postRepository.searchPosts(keyword, params);
  }
}

export class SearchPostsByCategoryUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(
    keyword: string,
    categorySlug: string,
    params: { page?: number; size?: number; sort?: string }
  ) {
    return this.postRepository.searchPostsByCategory(
      keyword,
      categorySlug,
      params
    );
  }
}

export class GetPostByIdUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(id: number): Promise<PostDto> {
    return this.postRepository.getPostById(id);
  }
}

export class GetPostBySlugUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(categorySlug: string, postSlug: string): Promise<PostDto> {
    return this.postRepository.getPostBySlug(categorySlug, postSlug);
  }
}

export class CreatePostNewUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(data: PostCreateDto): Promise<PostDto> {
    return this.postRepository.createPostNew(data);
  }
}

export class UpdatePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(id: number, data: PostCreateDto): Promise<PostDto> {
    return this.postRepository.updatePostNew(id, data);
  }
}

export class DeletePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(id: number): Promise<void> {
    return this.postRepository.deletePostNew(id);
  }
}

export class GetRepliesByPostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(postId: number): Promise<PostReplyDto[]> {
    return this.postRepository.getRepliesByPost(postId);
  }
}

export class AddReplyUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(postId: number, data: AddReplyDto): Promise<PostReplyDto> {
    return this.postRepository.addReply(postId, data);
  }
}

export class DeleteReplyUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(replyId: number): Promise<void> {
    return this.postRepository.deleteReply(replyId);
  }
}
