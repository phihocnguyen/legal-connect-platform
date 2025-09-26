'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePostUseCases } from '@/hooks/use-post-cases';
import { PostDto, PostCategoryDto } from '@/domain/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.category as string;

  const [category, setCategory] = useState<PostCategoryDto | null>(null);
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getCategoryBySlug, getPostsByCategory } = usePostUseCases();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading category:', categorySlug);

        // Load category info first
        const categoryData = await getCategoryBySlug(categorySlug);
        console.log('Category loaded:', categoryData);
        setCategory(categoryData);

        // Load posts for this category
        const postsData = await getPostsByCategory(categorySlug, {
          page: 0,
          size: 20,
          sort: 'createdAt,desc'
        });
        
        console.log('Posts loaded:', postsData);
        setPosts(postsData.content || []);
        
      } catch (err: unknown) {
        console.error('Error loading category data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Không thể tải dữ liệu';
        setError(`Lỗi tải dữ liệu: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    if (categorySlug) {
      loadData();
    }
  }, [categorySlug, getCategoryBySlug, getPostsByCategory]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 animate-fade-in">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Đang tải dữ liệu danh mục..." />
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="container mx-auto py-8 animate-fade-in">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Không tìm thấy danh mục'}</p>
          <Link href="/forum">
            <Button>Quay lại diễn đàn</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in">
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-gray-600">{category.description}</p>
              )}
            </div>
          </div>
          <Link href="/forum/new">
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
                  <AvatarFallback>{post.authorName?.[0] || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      href={`/forum/${categorySlug}/${post.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-[#004646]"
                    >
                      {post.title}
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                    <span>Đăng bởi <span className="text-[#004646]">{post.authorName}</span></span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-500 text-right">
                  <div className="mb-1">{post.replyCount} phản hồi</div>
                  <div>{post.viewCount} lượt xem</div>
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
  );
}
