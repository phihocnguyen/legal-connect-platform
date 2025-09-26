'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryCard } from '@/components/forum/category-card';
import { ForumStats } from '@/components/forum/forum-stats';
import { ForumSidebar } from '@/components/forum/forum-sidebar';
import { RecentPosts } from '@/components/forum/recent-posts';
import { usePostUseCases } from '@/hooks/use-post-cases';
import { PostCategoryDto, PostDto } from '@/domain/entities';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';

export default function ForumPage() {
  const [categories, setCategories] = useState<PostCategoryDto[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostDto[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getAllCategories, getAllPosts } = usePostUseCases();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Load categories and recent posts in parallel
        const [categoriesData, postsData] = await Promise.all([
          getAllCategories(),
          getAllPosts({ page: 0, size: 5, sort: 'createdAt,desc' })
        ]);
        
        setCategories(categoriesData);
        setRecentPosts(postsData.content);
      } catch (err) {
        console.error('Error loading forum data:', err);
        setError('Không thể tải dữ liệu diễn đàn. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAllCategories, getAllPosts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      // Navigate to search results page
      window.location.href = `/forum/search?q=${encodeURIComponent(searchKeyword)}`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 animate-fade-in">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Đang tải dữ liệu diễn đàn..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 animate-fade-in">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      {/* Header Section */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Diễn đàn Pháp luật</h1>
          <div className="flex gap-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="Tìm kiếm chủ đề..."
                className="w-64"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <Button type="submit">Tìm</Button>
            </form>
            <Link href="/forum/new">
              <Button>Tạo chủ đề mới</Button>
            </Link>
          </div>
        </div>
        <p className="text-gray-600">
          Nơi trao đổi, thảo luận về các vấn đề pháp luật. Hãy tham gia để nhận được sự hỗ trợ từ cộng đồng.
        </p>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 space-y-8">
          <RecentPosts posts={recentPosts} />
          <div className="grid grid-cols-1 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.slug}
                name={category.name}
                description={category.description || ''}
                icon={category.icon || '⚖️'}
                threads={category.postCount || 0}
                posts={category.postCount || 0}
              />
            ))}
          </div>
          <ForumStats />
        </div>

        {/* Sidebar */}
        <div className="w-80">
          <ForumSidebar />
        </div>
      </div>
    </div>
  );
}
