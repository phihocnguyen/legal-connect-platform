import Link from 'next/link';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface CategoryCardProps {
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

export function CategoryCard({
  id,
  name,
  description,
  icon,
  threads,
  posts,
  lastPost,
}: CategoryCardProps) {
  return (
    <HoverCard>
      <Link href={`/forum/${id}`} className="block">
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-start gap-4">
            <div className="text-4xl">{icon}</div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {description}
              </p>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <span>{threads} chủ đề</span>
                <span>{posts} bài viết</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="text-sm font-semibold">Bài viết mới nhất</h4>
          {lastPost && (
            <div className="text-sm">
              <p className="font-medium text-[#004646]">{lastPost.title}</p>
              <p className="text-gray-500">
                bởi {lastPost.author} • {lastPost.date}
              </p>
            </div>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
