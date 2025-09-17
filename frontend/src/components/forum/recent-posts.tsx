import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface Post {
  id: string;
  title: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'admin' | 'moderator' | 'lawyer' | 'user';
  };
  createdAt: string;
  replies: number;
  views: number;
  lastReply?: {
    author: string;
    date: string;
  };
  solved?: boolean;
  pinned?: boolean;
  isHot?: boolean;
}

const roleColors = {
  admin: 'text-red-600',
  moderator: 'text-blue-600',
  lawyer: 'text-green-600',
  user: 'text-gray-500'
};

const recentPosts: Post[] = [
  {
    id: '1',
    title: 'Hướng dẫn thủ tục đăng ký kết hôn với người nước ngoài',
    category: {
      id: 'dan-su',
      name: 'Luật Dân sự',
      color: 'bg-blue-100 text-blue-800'
    },
    author: {
      id: '1',
      name: 'Luật sư Nguyễn Văn A',
      avatar: '/avatars/lawyer1.jpg',
      role: 'lawyer'
    },
    createdAt: '2 giờ trước',
    replies: 15,
    views: 234,
    lastReply: {
      author: 'Trần Thị B',
      date: '15 phút trước'
    },
    solved: true,
    pinned: true
  },
  {
    id: '2',
    title: 'Thủ tục khởi kiện tranh chấp đất đai như thế nào?',
    category: {
      id: 'dat-dai',
      name: 'Luật Đất đai',
      color: 'bg-green-100 text-green-800'
    },
    author: {
      id: '2',
      name: 'Mod Lê Thị C',
      avatar: '/avatars/mod1.jpg',
      role: 'moderator'
    },
    createdAt: '3 giờ trước',
    replies: 8,
    views: 156,
    isHot: true
  },
  {
    id: '3',
    title: 'Quy định về thời giờ làm việc, nghỉ ngơi theo Bộ luật Lao động 2025',
    category: {
      id: 'lao-dong',
      name: 'Luật Lao động',
      color: 'bg-yellow-100 text-yellow-800'
    },
    author: {
      id: '3',
      name: 'Admin Phạm D',
      avatar: '/avatars/admin1.jpg',
      role: 'admin'
    },
    createdAt: '4 giờ trước',
    replies: 25,
    views: 567,
    lastReply: {
      author: 'Nguyễn E',
      date: '30 phút trước'
    },
    isHot: true
  },
  // Thêm các bài viết mẫu khác...
];

export function RecentPosts() {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Bài viết mới nhất</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <select className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
            <option value="all">Tất cả danh mục</option>
            <option value="dan-su">Luật Dân sự</option>
            <option value="hinh-su">Luật Hình sự</option>
            <option value="dat-dai">Luật Đất đai</option>
            <option value="lao-dong">Luật Lao động</option>
            <option value="kinh-doanh">Luật Kinh doanh</option>
          </select>

          <select className="rounded-md border border-gray-300 px-3 py-1.5 text-sm">
            <option value="latest">Mới nhất</option>
            <option value="hot">Bài hot</option>
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
            🏆 Đã giải đáp
          </button>
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
        {recentPosts.map((post) => (
          <div key={post.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start gap-4">
              {/* Author Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
              </Avatar>

              {/* Post Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Badges */}
                <div className="flex items-center gap-2 mb-1">
                  {post.pinned && (
                    <Badge variant="outline" className="gap-1">
                      📌 Ghim
                    </Badge>
                  )}
                  {post.isHot && (
                    <Badge variant="outline" className="gap-1 border-red-500 text-red-500">
                      🔥 Hot
                    </Badge>
                  )}
                  {post.solved && (
                    <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
                      ✓ Đã giải đáp
                    </Badge>
                  )}
                  <Link 
                    href={`/forum/${post.category.id}/${post.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-[#004646] truncate"
                  >
                    {post.title}
                  </Link>
                </div>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <Badge
                    variant="secondary"
                    className={post.category.color}
                  >
                    {post.category.name}
                  </Badge>
                  <span className={`${roleColors[post.author.role]}`}>
                    {post.author.name}
                  </span>
                  <span className="text-gray-500">
                    {post.createdAt}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="text-sm text-right shrink-0">
                <div className="mb-1 text-gray-500">
                  {post.replies} phản hồi
                </div>
                <div className="text-gray-500">
                  {post.views} lượt xem
                </div>
                {post.lastReply && (
                  <div className="mt-2 text-xs text-gray-500">
                    Trả lời cuối bởi{' '}
                    <Link href="#" className="text-[#004646] hover:underline">
                      {post.lastReply.author}
                    </Link>
                    <br />
                    {post.lastReply.date}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Link */}
    </div>
  );
}
