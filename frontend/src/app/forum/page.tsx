'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryCard } from '@/components/forum/category-card';
import { ForumStats } from '@/components/forum/forum-stats';
import { ForumSidebar } from '@/components/forum/forum-sidebar';
import { RecentPosts } from '@/components/forum/recent-posts';
import { usePostUseCases } from '@/hooks/use-post-cases';
import { PostCategoryDto, PostDto } from '@/domain/entities';
import Link from 'next/link';

export default function ForumPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [categories, setCategories] = useState<PostCategoryDto[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostDto[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '0'));
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('size') || '10'));
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    searchParams.get('categoryId') ? parseInt(searchParams.get('categoryId')!) : null
  );
  const [sortBy, setSortBy] = useState(decodeURIComponent(searchParams.get('sort') || 'createdAt,desc'));
  const [timeFilter, setTimeFilter] = useState(searchParams.get('time') || 'all');

  const { getAllCategories, getAllPosts } = usePostUseCases();

  const updateURL = useCallback((params: {
    page?: number;
    size?: number;
    category?: number | null;
    sort?: string;
    time?: string;
  }) => {
    const urlParams = new URLSearchParams();
    
    if (params.page !== undefined && params.page > 0) {
      urlParams.set('page', params.page.toString());
    }
    if (params.size !== undefined && params.size !== 10) {
      urlParams.set('size', params.size.toString());
    }
    if (params.category) {
      urlParams.set('categoryId', params.category.toString());
    }
    if (params.sort && params.sort !== 'createdAt,desc') {
      urlParams.set('sort', params.sort);
    }
    if (params.time && params.time !== 'all') {
      urlParams.set('time', params.time);
    }

    const newURL = urlParams.toString() ? `/forum?${urlParams.toString()}` : '/forum';
    router.push(newURL, { scroll: false });
  }, [router]);

  // Không cần loading context cho initial load - chỉ dùng skeleton

  const loadPosts = useCallback(async (page: number = 0, showLoading: boolean = false) => {
    try {
      if (showLoading) {
        setPostsLoading(true);
      }
      
      const params: { 
        page: number; 
        size: number; 
        sort: string; 
        categoryId?: number; 
        timeFilter?: string; 
      } = { 
        page, 
        size: pageSize, 
        sort: sortBy 
      };
      
      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }
      
      if (timeFilter !== 'all') {
        params.timeFilter = timeFilter;
      }

      const data = await getAllPosts(params);
      console.log('API Request params:', params); // Debug log
      console.log('API Response:', data);
      
      const posts = data.content || data || [];
      const total = data.totalElements || posts.length || 0;
      const pages = data.totalPages || (total > 0 ? Math.ceil(total / pageSize) : 1);
      const currentPageNum = data.number !== undefined ? data.number : page;
      
      setRecentPosts(posts);
      setTotalPages(pages);
      setTotalElements(total);
      setCurrentPage(currentPageNum);
      
      console.log('Pagination Data:', { 
        posts: posts.length, 
        total, 
        pages, 
        currentPageNum, 
        pageSize 
      });
    } catch (err) {
      console.error('Error loading posts:', err);
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
    } finally {
      if (showLoading) {
        setPostsLoading(false);
      }
    }
  }, [getAllPosts, pageSize, sortBy, selectedCategory, timeFilter]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setPostsLoading(true);

      // Load posts with current URL params
      await loadPosts(currentPage, false);
      setPostsLoading(false);

    } catch (err) {
      console.error('Error loading forum data:', err);
      setError('Không thể tải dữ liệu diễn đàn. Vui lòng thử lại sau.');
      setPostsLoading(false);
    }
  }, [loadPosts, currentPage]);

  // Load categories only once
  useEffect(() => {
    getAllCategories().then(data => {
      setCategories(data);
    }).catch(err => {
      console.error('Error loading categories:', err);
    });
  }, [getAllCategories]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({ 
      page, 
      size: pageSize, 
      category: selectedCategory, 
      sort: sortBy, 
      time: timeFilter 
    });
    setPostsLoading(true);
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(0);
    updateURL({ 
      page: 0, 
      size: pageSize, 
      category: categoryId, 
      sort: sortBy, 
      time: timeFilter 
    });
    setPostsLoading(true);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(0);
    updateURL({ 
      page: 0, 
      size: pageSize, 
      category: selectedCategory, 
      sort, 
      time: timeFilter 
    });
    setPostsLoading(true);
  };

  const handleTimeFilterChange = (filter: string) => {
    setTimeFilter(filter);
    setCurrentPage(0);
    updateURL({ 
      page: 0, 
      size: pageSize, 
      category: selectedCategory, 
      sort: sortBy, 
      time: filter 
    });
    setPostsLoading(true);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(0);
    updateURL({ 
      page: 0, 
      size, 
      category: selectedCategory, 
      sort: sortBy, 
      time: timeFilter 
    });
    loadPosts(0, true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      window.location.href = `/forum/search?q=${encodeURIComponent(searchKeyword)}`;
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
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
          <RecentPosts 
            posts={recentPosts}
            categories={categories}
            totalPages={totalPages}
            totalElements={totalElements}
            currentPage={currentPage}
            pageSize={pageSize}
            selectedCategory={selectedCategory}
            sortBy={sortBy}
            timeFilter={timeFilter}
            isLoading={postsLoading}
            onPageChange={handlePageChange}
            onCategoryChange={handleCategoryChange}
            onSortChange={handleSortChange}
            onTimeFilterChange={handleTimeFilterChange}
            onPageSizeChange={handlePageSizeChange}
          />
          <div className="grid grid-cols-1 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                id={category.slug}
                name={category.name}
                description={category.description || ''}
                icon={category.icon || '⚖️'}
                threads={category.threadsCount || 0}
                posts={category.postsCount || 0}
              />
            ))}
          </div>
          <ForumStats />
        </div>
        <div className="w-80">
          <ForumSidebar />
        </div>
      </div>
    </div>
  );
}
