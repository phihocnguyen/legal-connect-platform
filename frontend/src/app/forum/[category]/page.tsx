"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePostUseCases } from "@/hooks/use-post-cases";
import { useLoadingState } from "@/hooks/use-loading-state";
import { PostDto, PostCategoryDto } from "@/domain/entities";

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const [category, setCategory] = useState<PostCategoryDto | null>(null);
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { getCategoryBySlug, getPostsByCategory } = usePostUseCases();
  const { startLoading, stopLoading, isLoading } = useLoadingState();

  const loadData = useCallback(async () => {
    try {
      startLoading("Đang tải...");
      setError(null);

      const categoryData = await getCategoryBySlug(categorySlug);
      setCategory(categoryData);

      const postsData = await getPostsByCategory(categorySlug, {
        page: 0,
        size: 20,
        sort: "createdAt,desc",
      });

      setPosts(postsData.content || []);
    } catch (err: unknown) {
      console.error("Error loading category data:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu";
      setError(`Lỗi tải dữ liệu: ${errorMessage}`);
    } finally {
      stopLoading();
    }
  }, [
    categorySlug,
    getCategoryBySlug,
    getPostsByCategory,
    startLoading,
    stopLoading,
  ]);

  useEffect(() => {
    if (categorySlug) {
      loadData();
    }
  }, [categorySlug, loadData]);

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={loadData}>Thử lại</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return null;
  }

  return (
    <div>
      {category && (
        <div className="container mx-auto py-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/forum">Diễn đàn</Link>
              <span>→</span>
              <span>{category.name}</span>
            </div>

            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                {category.icon && (
                  <div className="text-4xl">{category.icon}</div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {category.name}
                  </h1>
                  {category.description && (
                    <p className="text-gray-600">{category.description}</p>
                  )}
                </div>
              </div>
              <Link href={`/forum/new?category=${categorySlug}`}>
                <Button>Tạo chủ đề mới</Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow divide-y">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={post.author.avatar}
                        alt={post.author.name}
                      />
                      <AvatarFallback>
                        {post.author?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/forum/${categorySlug}/${
                            post.slug || post.id
                          }`}
                          className="text-lg font-semibold text-gray-900 hover:text-[#004646]"
                        >
                          {post.title}
                        </Link>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span>
                          Đăng bởi{" "}
                          <span className="text-[#004646]">
                            {post.author?.name}
                          </span>
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      <div className="mb-1">{post.replyCount} phản hồi</div>
                      <div>{post.views} lượt xem</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                Chưa có bài viết nào trong danh mục này
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
