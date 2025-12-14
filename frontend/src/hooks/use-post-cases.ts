import { useCallback } from "react";
import { container } from "../infrastructure/container";
import axiosInstance from "@/lib/axiosInstance";
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
  GetPostBySlugUseCase,
  CreatePostNewUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  GetRepliesByPostUseCase,
  AddReplyUseCase,
  DeleteReplyUseCase,
} from "../application/use-cases/post.use-case";
import { PostCreateDto, AddReplyDto } from "../domain/entities";

export function usePostUseCases() {
  // Legacy methods
  const createPost = useCallback(
    (data: {
      title: string;
      content: string;
      categoryId: number;
      tags: string[];
    }) => {
      const useCase =
        container.getUseCase<CreatePostUseCase>("CreatePostUseCase");
      return useCase.execute(data);
    },
    []
  );

  const getPosts = useCallback(
    (params: {
      category?: string;
      page?: number;
      limit?: number;
      tag?: string;
    }) => {
      const useCase = container.getUseCase<GetPostsUseCase>("GetPostsUseCase");
      return useCase.execute(params);
    },
    []
  );

  const votePost = useCallback((postId: string, voteType: 1 | -1) => {
    const useCase = container.getUseCase<VotePostUseCase>("VotePostUseCase");
    return useCase.execute(postId, voteType);
  }, []);

  // New Forum API hooks
  const getAllCategories = useCallback(() => {
    const useCase = container.getUseCase<GetAllCategoriesUseCase>(
      "GetAllCategoriesUseCase"
    );
    return useCase.execute();
  }, []);

  const getCategoryBySlug = useCallback((slug: string) => {
    const useCase = container.getUseCase<GetCategoryBySlugUseCase>(
      "GetCategoryBySlugUseCase"
    );
    return useCase.execute(slug);
  }, []);

  const getAllPosts = useCallback(
    (params: {
      page?: number;
      size?: number;
      sort?: string;
      categoryId?: number;
      timeFilter?: string;
    }) => {
      const useCase =
        container.getUseCase<GetAllPostsUseCase>("GetAllPostsUseCase");
      return useCase.execute(params);
    },
    []
  );

  const getPostsByCategory = useCallback(
    (
      categorySlug: string,
      params: { page?: number; size?: number; sort?: string }
    ) => {
      const useCase = container.getUseCase<GetPostsByCategoryUseCase>(
        "GetPostsByCategoryUseCase"
      );
      return useCase.execute(categorySlug, params);
    },
    []
  );

  const searchPosts = useCallback(
    (
      keyword: string,
      params: { page?: number; size?: number; sort?: string }
    ) => {
      const useCase =
        container.getUseCase<SearchPostsUseCase>("SearchPostsUseCase");
      return useCase.execute(keyword, params);
    },
    []
  );

  const searchPostsByCategory = useCallback(
    (
      keyword: string,
      categorySlug: string,
      params: { page?: number; size?: number; sort?: string }
    ) => {
      const useCase = container.getUseCase<SearchPostsByCategoryUseCase>(
        "SearchPostsByCategoryUseCase"
      );
      return useCase.execute(keyword, categorySlug, params);
    },
    []
  );

  const getPostById = useCallback((id: number) => {
    const useCase =
      container.getUseCase<GetPostByIdUseCase>("GetPostByIdUseCase");
    return useCase.execute(id);
  }, []);

  const getPostBySlug = useCallback(
    (categorySlug: string, postSlug: string) => {
      const useCase = container.getUseCase<GetPostBySlugUseCase>(
        "GetPostBySlugUseCase"
      );
      return useCase.execute(categorySlug, postSlug);
    },
    []
  );

  const createPostNew = useCallback((data: PostCreateDto) => {
    const useCase = container.getUseCase<CreatePostNewUseCase>(
      "CreatePostNewUseCase"
    );
    return useCase.execute(data);
  }, []);

  const updatePost = useCallback((id: number, data: PostCreateDto) => {
    const useCase =
      container.getUseCase<UpdatePostUseCase>("UpdatePostUseCase");
    return useCase.execute(id, data);
  }, []);

  const deletePost = useCallback((id: number) => {
    const useCase =
      container.getUseCase<DeletePostUseCase>("DeletePostUseCase");
    return useCase.execute(id);
  }, []);

  const getRepliesByPost = useCallback((postId: number) => {
    const useCase = container.getUseCase<GetRepliesByPostUseCase>(
      "GetRepliesByPostUseCase"
    );
    return useCase.execute(postId);
  }, []);

  const addReply = useCallback((postId: number, data: AddReplyDto) => {
    const useCase = container.getUseCase<AddReplyUseCase>("AddReplyUseCase");
    return useCase.execute(postId, data);
  }, []);

  const deleteReply = useCallback((replyId: number) => {
    const useCase =
      container.getUseCase<DeleteReplyUseCase>("DeleteReplyUseCase");
    return useCase.execute(replyId);
  }, []);

  const incrementPostViews = useCallback(
    (categorySlug: string, postSlug: string) => {
      return axiosInstance.post(
        `/forum/categories/${categorySlug}/posts/${postSlug}/increment-views`
      );
    },
    []
  );

  return {
    createPost,
    getPosts,
    votePost,
    getAllCategories,
    getCategoryBySlug,
    getAllPosts,
    getPostsByCategory,
    searchPosts,
    searchPostsByCategory,
    getPostById,
    getPostBySlug,
    createPostNew,
    updatePost,
    deletePost,
    getRepliesByPost,
    addReply,
    deleteReply,
    incrementPostViews,
  };
}
