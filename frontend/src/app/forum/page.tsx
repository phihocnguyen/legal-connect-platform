"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategoryWithSub } from "@/components/forum/category-with-sub";
import { ForumStats } from "@/components/forum/forum-stats";
import { ForumSidebar } from "@/components/forum/forum-sidebar";
import { RecentPosts } from "@/components/forum/recent-posts";
import { usePostUseCases } from "@/hooks/use-post-cases";
import { PostCategoryDto, PostDto } from "@/domain/entities";
import axiosInstance from "@/lib/axiosInstance";

export default function ForumPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<PostCategoryDto[]>([]);
  const [recentPosts, setRecentPosts] = useState<PostDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [postsLoading, setPostsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("createdAt,desc");
  const [timeFilter, setTimeFilter] = useState("all");

  // Sync state from URL params on initial load
  useEffect(() => {
    // Convert from 1-indexed URL to 0-indexed state
    const urlPage = parseInt(searchParams.get("page") || "1");
    setCurrentPage(Math.max(0, urlPage - 1));
    setPageSize(parseInt(searchParams.get("size") || "5"));
    setSelectedCategory(
      searchParams.get("categoryId")
        ? parseInt(searchParams.get("categoryId")!)
        : null
    );
    setSortBy(
      decodeURIComponent(searchParams.get("sort") || "createdAt,desc")
    );
    setTimeFilter(searchParams.get("time") || "all");
  }, [searchParams]);

  const { getAllCategories } = usePostUseCases();

  // Load categories only once on mount
  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      try {
        const data = await getAllCategories();
        if (mounted) {
          setCategories(data);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
      } finally {
        if (mounted) {
          setCategoriesLoading(false);
        }
      }
    };
    loadCategories();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateURL = useCallback(
    (params: {
      page?: number;
      size?: number;
      category?: number | null;
      sort?: string;
      time?: string;
    }) => {
      const urlParams = new URLSearchParams();

      // Always set page param (convert 0-indexed to 1-indexed for URL)
      if (params.page !== undefined) {
        urlParams.set("page", (params.page + 1).toString());
      }
      if (params.size !== undefined) {
        urlParams.set("size", params.size.toString());
      }
      if (params.category) {
        urlParams.set("categoryId", params.category.toString());
      }
      if (params.sort && params.sort !== "createdAt,desc") {
        urlParams.set("sort", params.sort);
      }
      if (params.time && params.time !== "all") {
        urlParams.set("time", params.time);
      }

      const newURL = urlParams.toString()
        ? `/forum?${urlParams.toString()}`
        : "/forum";
      router.push(newURL, { scroll: false });
    },
    [router]
  );

  // Không cần loading context cho initial load - chỉ dùng skeleton

  const loadPosts = useCallback(
    async (page: number = 0) => {
      try {
        setPostsLoading(true);

        const params: Record<string, string | number> = {
          page,
          size: pageSize,
          sort: sortBy,
        };
        console.log("[FORUM] Loading posts - page:", page, "sort:", sortBy, "category:", selectedCategory, "time:", timeFilter);
        
        if (selectedCategory) {
          params.categoryId = selectedCategory;
        }

        if (timeFilter !== "all") {
          params.timeFilter = timeFilter;
        }

        const response = await axiosInstance.get("/forum/posts", { params });
        const data = response.data;
        
        // API returns {content: [...], page: {totalPages, totalElements, number, size}}
        const posts = data.content || [];
        const pageInfo = data.page || {};
        const total = pageInfo.totalElements || posts.length || 0;
        const pages = pageInfo.totalPages || (total > 0 ? Math.ceil(total / pageSize) : 1);

        setRecentPosts(posts);
        setTotalPages(pages);
        setTotalElements(total);
        setPostsLoading(false);
      } catch (err) {
        console.error("Error loading posts:", err);
        setError("Không thể tải bài viết. Vui lòng thử lại sau.");
        setPostsLoading(false);
      }
    },
    [pageSize, sortBy, selectedCategory, timeFilter]
  );

  useEffect(() => {
    loadPosts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, selectedCategory, sortBy, timeFilter]);

  // Filter handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateURL({
      page,
      size: pageSize,
      category: selectedCategory,
      sort: sortBy,
      time: timeFilter,
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
      time: timeFilter,
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
      time: timeFilter,
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
      time: filter,
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
      time: timeFilter,
    });
    setPostsLoading(true);
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
      <div className="flex gap-8">
        <div className="flex-1 space-y-8">
          {/* Main Forum Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Diễn đàn Pháp luật
            </h1>
            <p className="text-gray-600">
              Trao đổi, hỏi đáp và cập nhật kiến thức về luật pháp
            </p>
          </div>
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
          {/* Categories Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Danh mục Diễn đàn
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {categoriesLoading ? (
                // Skeleton loading for categories
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-lg shadow p-6 animate-pulse"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-3">
                          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                          <div className="flex gap-4">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <CategoryWithSub
                    key={category.id}
                    id={category.slug}
                    name={category.name}
                    description={category.description || ""}
                    icon={category.icon || "⚖️"}
                    threads={category.threadsCount || 0}
                    posts={category.postsCount || 0}
                    subCategories={[]}
                    lastPost={
                      category.lastPost
                        ? {
                            ...category.lastPost,
                            categoryName: category.name,
                            categorySlug: category.slug,
                          }
                        : undefined
                    }
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Chưa có danh mục nào
                </div>
              )}
            </div>
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
