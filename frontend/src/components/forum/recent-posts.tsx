import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import { PostDto, PostCategoryDto } from "@/domain/entities";
import { PostsSkeleton } from "./posts-skeleton";
import { formatRelativeTime } from "@/lib/date-utils";
import Image from "next/image";

interface RecentPostsProps {
  posts: PostDto[];
  categories: PostCategoryDto[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
  selectedCategory: number | null;
  sortBy: string;
  timeFilter: string;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onCategoryChange: (categoryId: number | null) => void;
  onSortChange: (sort: string) => void;
  onTimeFilterChange: (filter: string) => void;
  onPageSizeChange: (size: number) => void;
}

export function RecentPosts({
  posts,
  categories,
  totalPages,
  totalElements,
  currentPage,
  pageSize,
  selectedCategory,
  sortBy,
  timeFilter,
  isLoading = false,
  onPageChange,
  onCategoryChange,
  onSortChange,
  onTimeFilterChange,
  onPageSizeChange,
}: RecentPostsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bài viết mới nhất</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Danh mục:
            </label>
            <Select
              value={selectedCategory?.toString() || "all"}
              onValueChange={(value) =>
                onCategoryChange(value === "all" ? null : parseInt(value))
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Sắp xếp:
            </label>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt,desc">Mới nhất</SelectItem>
                <SelectItem value="views,desc">Xem nhiều nhất</SelectItem>
                <SelectItem value="replyCount,desc">
                  Nhiều phản hồi nhất
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Thời gian:
            </label>
            <Select value={timeFilter} onValueChange={onTimeFilterChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">Tuần này</SelectItem>
                <SelectItem value="month">Tháng này</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Hiển thị:</label>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-sm text-gray-500">Lọc nhanh:</span>
          <button className="px-2 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200">
            📌 Ghim
          </button>
          <button className="px-2 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200">
            🔥 Hot
          </button>
          <button className="px-2 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200">
            👨‍⚖️ Luật sư trả lời
          </button>
        </div>
      </div>

      <div className="divide-y">
        {isLoading ? (
          <PostsSkeleton count={pageSize} />
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/forum/${post.category.slug}/${post.slug}`}
              className="block p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <Image
                    width={40}
                    height={40}
                    src={post.author.avatar || "/default-avatar.png"}
                    alt={post.author.name || "User Avatar"}
                  />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {post.title}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {post.category.name}
                    </Badge>
                    <span className="text-gray-600">{post.author.name}</span>
                    <span className="text-gray-500">
                      {formatRelativeTime(post.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-right shrink-0">
                  <div className="mb-1 text-gray-500">
                    {post.replyCount} phản hồi
                  </div>
                  <div className="text-gray-500">{post.views} lượt xem</div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            Chưa có bài viết nào
          </div>
        )}
      </div>

      <div className="border-t">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={pageSize}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
}
