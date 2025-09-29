import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PostDto } from '@/domain/entities';
import Image from 'next/image';

interface RecentPostsProps {
  posts: PostDto[];
}

// const roleColors = {
//   admin: 'text-red-600',
//   moderator: 'text-blue-600',
//   lawyer: 'text-green-600',
//   user: 'text-gray-500'
// };

export function RecentPosts({ posts }: RecentPostsProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Vừa xong';
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bài viết mới nhất</h2>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <select className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
            <option value="all">Tất cả danh mục</option>
          </select>

          <select className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
            <option value="latest">Mới nhất</option>
            <option value="most-viewed">Xem nhiều nhất</option>
            <option value="most-replied">Nhiều phản hồi nhất</option>
          </select>

          <select className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="all-time">Tất cả</option>
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <label className="text-sm text-gray-500">Hiển thị:</label>
            <select className="rounded-md border border-gray-300 px-2 py-1.5 text-sm">
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
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
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start gap-4">
                <Avatar className="w-10 h-10">
                  <Image width={40} height={40} src={post.author.avatar || '/default-avatar.png'} alt={post.author.name || 'User Avatar'} />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link 
                      href={`/forum/${post.category.slug}/${post.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-[#004646] truncate"
                    >
                      {post.title}
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      {post.category.name}
                    </Badge>
                    <span className="text-gray-600">
                      {post.author.name}
                    </span>
                    <span className="text-gray-500">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-right shrink-0">
                  <div className="mb-1 text-gray-500">
                    {post.replyCount} phản hồi
                  </div>
                  <div className="text-gray-500">
                    {post.views} lượt xem
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            Chưa có bài viết nào
          </div>
        )}
      </div>
    </div>
  );
}
