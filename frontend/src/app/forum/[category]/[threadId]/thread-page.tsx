'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    joinDate: string;
    posts: number;
  };
  content: string;
  likes?: number;
  createdAt: string;
  votes: {
    upvotes: number;
    downvotes: number;
    userVote?: 'up' | 'down' | null;
  };
  isAuthor?: boolean;
}

interface ThreadPageProps {
  category: string;
  threadId: string;
}

const thread = {
  id: '1',
  title: 'Hướng dẫn chi tiết về thủ tục ly hôn thuận tình',
  category: 'Luật Dân sự',
  tags: ['Ly hôn', 'Thủ tục', 'Hướng dẫn'],
  views: 1205,
  createdAt: '2025-09-15',
};

const posts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Luật sư Nguyễn Văn A',
      avatar: '/avatars/lawyer1.jpg',
      role: 'Luật sư',
      joinDate: '2024-01-15',
      posts: 1234,
    },
    votes: {
      upvotes: 45,
      downvotes: 2,
      userVote: null
    },
    content: `Xin chào mọi người,

Trong bài viết này, tôi sẽ hướng dẫn chi tiết về thủ tục ly hôn thuận tình. Đây là một vấn đề phức tạp và cần được thực hiện đúng quy trình để đảm bảo quyền lợi của các bên.

## 1. Điều kiện ly hôn thuận tình

- Hai bên tự nguyện ly hôn
- Đã đăng ký kết hôn hợp pháp
- Có thỏa thuận về việc chia tài sản và nuôi con (nếu có)

## 2. Hồ sơ cần chuẩn bị

1. Đơn xin ly hôn (có chữ ký của cả hai bên)
2. Giấy chứng nhận kết hôn (bản chính)
3. Giấy CMND/CCCD của cả hai bên
4. Văn bản thỏa thuận về tài sản và con cái

## 3. Quy trình thực hiện

1. Nộp hồ sơ tại TAND có thẩm quyền
2. Tòa thụ lý và hẹn ngày hòa giải
3. Tham gia phiên hòa giải
4. Nhận quyết định công nhận thuận tình ly hôn

Mọi người có thắc mắc gì có thể comment bên dưới, tôi sẽ giải đáp chi tiết.`,
    createdAt: '2025-09-15 09:00:00',
    likes: 45,
    isAuthor: true
  },
  {
    id: '2',
    author: {
      name: 'Trần Thị B',
      avatar: '/avatars/user1.jpg',
      role: 'Thành viên',
      joinDate: '2025-03-20',
      posts: 23,
    },
    content: 'Cảm ơn luật sư đã chia sẻ thông tin hữu ích. Tôi có một câu hỏi: Trong trường hợp hai bên đã thỏa thuận về tài sản nhưng chưa thống nhất về việc nuôi con thì có được xem là thuận tình không ạ?',
    createdAt: '2025-09-15 10:30:00',
    votes: {
      upvotes: 2,
      downvotes: 0,
      userVote: null
    }
  },
];

export function ThreadPageContent({ category, threadId }: ThreadPageProps) {
  const [replies, setReplies] = useState(posts);

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setReplies(replies.map(reply => {
      if (reply.id === postId) {
        const currentVote = reply.votes.userVote;
        let newUpvotes = reply.votes.upvotes;
        let newDownvotes = reply.votes.downvotes;

        // Remove previous vote if exists
        if (currentVote === 'up') newUpvotes--;
        if (currentVote === 'down') newDownvotes--;

        // Add new vote if different from current
        if (currentVote !== voteType) {
          if (voteType === 'up') newUpvotes++;
          if (voteType === 'down') newDownvotes++;
        }

        return {
          ...reply,
          votes: {
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: currentVote === voteType ? null : voteType
          }
        };
      }
      return reply;
    }));
  };

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/forum">Diễn đàn</Link>
        <span>→</span>
        <Link href={`/forum/${category}`}>{thread.category}</Link>
        <span>→</span>
        <span className="truncate">{thread.title}</span>
      </div>

      {/* Thread Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
          <Button>Trả lời</Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span>{thread.views} lượt xem</span>
          <span>•</span>
          <span>{thread.createdAt}</span>
          <div className="flex gap-2">
            {thread.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-6">
        {replies.map((post) => (
          <div 
            key={post.id} 
            className={`bg-white rounded-lg shadow ${
              post.author.role === 'Luật sư' 
                ? 'ring-2 ring-[#004646]/20 shadow-lg shadow-emerald-50' 
                : ''
            }`}
          >
            <div className="p-6">
              <div className="flex gap-6">
                {/* Author Info */}
                <div className="w-48 flex flex-col items-center text-center">
                  <Avatar className="w-20 h-20 mb-3" />
                  <div className="font-semibold text-gray-900">{post.author.name}</div>
                  <Badge 
                    variant={post.author.role === 'Luật sư' ? 'default' : 'secondary'}
                    className={`mt-1 ${post.author.role === 'Luật sư' ? 'bg-[#004646]' : ''}`}
                  >
                    {post.author.role}
                  </Badge>
                  <div className="mt-3 text-sm text-gray-500">
                    <div>Tham gia: {post.author.joinDate}</div>
                    <div>Bài viết: {post.author.posts}</div>
                  </div>
                </div>

                {/* Post Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-sm text-gray-500">{post.createdAt}</span>
                    <div className="flex items-center gap-2">
                      {post.isAuthor && (
                        <Badge variant="outline">Tác giả</Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        Trích dẫn
                      </Button>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    {post.content}
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(post.id, 'up')}
                        className={post.votes.userVote === 'up' ? 'text-[#004646]' : ''}
                      >
                        ↑ {post.votes.upvotes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVote(post.id, 'down')}
                        className={post.votes.userVote === 'down' ? 'text-red-500' : ''}
                      >
                        ↓ {post.votes.downvotes}
                      </Button>
                    </div>
                    <Button variant="ghost" size="sm">
                      Chia sẻ
                    </Button>
                    {post.isAuthor && (
                      <Button variant="ghost" size="sm">
                        Chỉnh sửa
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Trả lời</h3>
        <textarea
          className="w-full min-h-[200px] p-4 border rounded-lg resize-y"
          placeholder="Viết câu trả lời của bạn..."
        />
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Hỗ trợ định dạng Markdown
          </div>
          <Button>Gửi trả lời</Button>
        </div>
      </div>
    </div>
  );
}
