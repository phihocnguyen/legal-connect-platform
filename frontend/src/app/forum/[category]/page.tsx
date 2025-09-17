'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Thread {
  id: string;
  title: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  replies: number;
  views: number;
  isPinned?: boolean;
  isHot?: boolean;
  lastReply?: {
    author: string;
    date: string;
  };
  tags?: string[];
}

const threads: Thread[] = [
  {
    id: '1',
    title: 'Hướng dẫn chi tiết về thủ tục ly hôn thuận tình',
    author: {
      name: 'Luật sư Nguyễn Văn A',
      avatar: '/avatars/lawyer1.jpg'
    },
    createdAt: '2025-09-15',
    replies: 24,
    views: 1205,
    isPinned: true,
    tags: ['Ly hôn', 'Thủ tục', 'Hướng dẫn'],
    lastReply: {
      author: 'Trần B',
      date: '15 phút trước'
    }
  },
  {
    id: '2',
    title: 'Quyền thừa kế của con riêng và con chung',
    author: {
      name: 'Luật sư Lê Thị C',
      avatar: '/avatars/lawyer2.jpg'
    },
    createdAt: '2025-09-14',
    replies: 35,
    views: 2300,
    isHot: true,
    tags: ['Thừa kế', 'Tài sản'],
    lastReply: {
      author: 'Phạm D',
      date: '1 giờ trước'
    }
  },
  // Add more sample threads...
];

export default function CategoryPage({  }: { params: { category: string } }) {
  return (
    <div className="container mx-auto py-8 animate-fade-in">
      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link href="/forum">Diễn đàn</Link>
          <span>→</span>
          <span>Luật Dân sự</span>
        </div>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Luật Dân sự</h1>
            <p className="text-gray-600">
              Thảo luận về các vấn đề liên quan đến luật dân sự, hợp đồng, thừa kế...
            </p>
          </div>
          <Button>Tạo chủ đề mới</Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <Input
            type="search"
            placeholder="Tìm kiếm trong chuyên mục..."
            className="max-w-md"
          />
          <select className="rounded-md border border-gray-300 px-3 py-2">
            <option>Tất cả thời gian</option>
            <option>Hôm nay</option>
            <option>Tuần này</option>
            <option>Tháng này</option>
          </select>
          <select className="rounded-md border border-gray-300 px-3 py-2">
            <option>Sắp xếp theo</option>
            <option>Mới nhất</option>
            <option>Nhiều phản hồi nhất</option>
            <option>Nhiều lượt xem nhất</option>
          </select>
        </div>
      </div>

      {/* Threads List */}
      <div className="bg-white rounded-lg shadow divide-y">
        {threads.map((thread) => (
          <div key={thread.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start gap-4">
              <Avatar className="w-10 h-10">
                <AvatarImage src={thread.author.avatar} alt={thread.author.name} />
                <AvatarFallback>{thread.author.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {thread.isPinned && (
                    <Badge variant="secondary">📌 Ghim</Badge>
                  )}
                  {thread.isHot && (
                    <Badge variant="secondary">🔥 Hot</Badge>
                  )}
                  <Link 
                    href={`/forum/dan-su/${thread.id}`}
                    className="text-lg font-semibold text-gray-900 hover:text-[#004646]"
                  >
                    {thread.title}
                  </Link>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  <span>Đăng bởi <Link href="#" className="text-[#004646] hover:underline">{thread.author.name}</Link></span>
                  <span>•</span>
                  <span>{thread.createdAt}</span>
                  {thread.tags?.map(tag => (
                    <Badge key={tag} variant="outline" className="ml-2">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-sm text-gray-500 text-right">
                <div className="mb-1">{thread.replies} phản hồi</div>
                <div>{thread.views} lượt xem</div>
                {thread.lastReply && (
                  <div className="mt-2 text-xs">
                    Trả lời cuối bởi <Link href="#" className="text-[#004646] hover:underline">{thread.lastReply.author}</Link>
                    <br />
                    {thread.lastReply.date}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center gap-2">
        <Button variant="outline" size="sm">Trước</Button>
        <Button variant="outline" size="sm">1</Button>
        <Button variant="default" size="sm">2</Button>
        <Button variant="outline" size="sm">3</Button>
        <Button variant="outline" size="sm">...</Button>
        <Button variant="outline" size="sm">12</Button>
        <Button variant="outline" size="sm">Sau</Button>
      </div>
    </div>
  );
}
