import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CategoryCard } from '@/components/forum/category-card';
import { ForumStats } from '@/components/forum/forum-stats';
import { ForumSidebar } from '@/components/forum/forum-sidebar';
import { RecentPosts } from '@/components/forum/recent-posts';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  threads: number;
  posts: number;
  lastPost?: {
    title: string;
    author: string;
    date: string;
  };
}

const categories: ForumCategory[] = [
  {
    id: 'dan-su',
    name: 'Luật Dân sự',
    description: 'Thảo luận về các vấn đề liên quan đến luật dân sự, hợp đồng, thừa kế...',
    icon: '⚖️',
    threads: 156,
    posts: 1240,
    lastPost: {
      title: 'Thủ tục thừa kế di sản',
      author: 'Nguyễn Văn A',
      date: '15 phút trước'
    }
  },
  {
    id: 'hinh-su',
    name: 'Luật Hình sự',
    description: 'Trao đổi về các vấn đề liên quan đến tội phạm, hình phạt...',
    icon: '👨‍⚖️',
    threads: 98,
    posts: 876,
    lastPost: {
      title: 'Các tình tiết giảm nhẹ hình phạt',
      author: 'Trần B',
      date: '1 giờ trước'
    }
  },
  {
    id: 'dat-dai',
    name: 'Luật Đất đai',
    description: 'Thảo luận về quyền sử dụng đất, giấy tờ nhà đất...',
    icon: '🏘️',
    threads: 234,
    posts: 1890,
    lastPost: {
      title: 'Thủ tục chuyển nhượng đất',
      author: 'Lê C',
      date: '2 giờ trước'
    }
  },
  {
    id: 'lao-dong',
    name: 'Luật Lao động',
    description: 'Trao đổi về quyền lợi người lao động, hợp đồng lao động...',
    icon: '👥',
    threads: 178,
    posts: 1456,
    lastPost: {
      title: 'Quyền lợi khi nghỉ việc',
      author: 'Phạm D',
      date: '3 giờ trước'
    }
  },
  {
    id: 'kinh-doanh',
    name: 'Luật Kinh doanh',
    description: 'Thảo luận về thành lập doanh nghiệp, đầu tư...',
    icon: '💼',
    threads: 145,
    posts: 980,
    lastPost: {
      title: 'Thủ tục thành lập công ty',
      author: 'Hoàng E',
      date: '4 giờ trước'
    }
  },
  {
    id: 'thue',
    name: 'Luật Thuế',
    description: 'Trao đổi về các vấn đề thuế, kê khai thuế...',
    icon: '📊',
    threads: 89,
    posts: 567,
    lastPost: {
      title: 'Hướng dẫn kê khai thuế TNCN',
      author: 'Mai F',
      date: '5 giờ trước'
    }
  }
];

export default function ForumPage() {
  return (
    <div className="container mx-auto py-8 animate-fade-in">
      {/* Header Section */}
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Diễn đàn Pháp luật</h1>
          <div className="flex gap-4">
            <Input
              type="search"
              placeholder="Tìm kiếm chủ đề..."
              className="w-64"
            />
            <Button>Tạo chủ đề mới</Button>
          </div>
        </div>
        <p className="text-gray-600">
          Nơi trao đổi, thảo luận về các vấn đề pháp luật. Hãy tham gia để nhận được sự hỗ trợ từ cộng đồng.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Recent Posts */}
          <RecentPosts />

          {/* Categories Grid */}
          <div className="grid grid-cols-1 gap-6">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                {...category}
              />
            ))}
          </div>

          {/* Forum Stats */}
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
