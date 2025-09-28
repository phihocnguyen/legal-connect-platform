'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryCard } from '@/components/forum/category-card';
import { ForumStats } from '@/components/forum/forum-stats';
import { ForumSidebar } from '@/components/forum/forum-sidebar';
import { RecentPosts } from '@/components/forum/recent-posts';
import { usePostUseCases } from '@/hooks/use-post-cases';
import { useLoadingState } from '@/hooks/use-loading-state';
import { PostCategoryDto, PostDto } from '@/domain/entities';
import Link from 'next/link';

export default function ForumPage() {
  const [categories, setCategories] = useState<PostCategoryDto[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostDto[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [postsLoaded, setPostsLoaded] = useState(false);

  const { getAllCategories, getAllPosts } = usePostUseCases();
  const { startLoading, stopLoading, isLoading } = useLoadingState();

  // Only stop loading when BOTH categories and posts are loaded
  const isDataLoaded = categoriesLoaded && postsLoaded;

  useEffect(() => {
    if (isDataLoaded) {
      stopLoading();
    }
  }, [isDataLoaded, stopLoading]);

  const loadData = useCallback(async () => {
    try {
      startLoading('Đang tải...');
      setError(null);
      setCategoriesLoaded(false);
      setPostsLoaded(false);

      // Load categories
      const categoriesPromise = getAllCategories().then(data => {
        setCategories(data);
        setCategoriesLoaded(true);
      });

      // Load recent posts
      const postsPromise = getAllPosts({ page: 0, size: 5, sort: 'createdAt,desc' }).then(data => {
        setRecentPosts(data.content);
        setPostsLoaded(true);
      });

      await Promise.all([categoriesPromise, postsPromise]);

    } catch (err) {
      console.error('Error loading forum data:', err);
      setError('Không thể tải dữ liệu diễn đàn. Vui lòng thử lại sau.');
      stopLoading();
    }
  }, [getAllCategories, getAllPosts, startLoading, stopLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      window.location.href = `/forum/search?q=${encodeURIComponent(searchKeyword)}`;
    }
  };

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
    return null; // Global loading indicator will show
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
