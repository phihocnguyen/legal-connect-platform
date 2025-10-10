interface PostsSkeletonProps {
  count: number;
}

export function PostsSkeleton({ count }: PostsSkeletonProps) {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex items-start gap-4 animate-pulse">
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
          <div className="space-y-1 text-right">
            <div className="h-3 bg-gray-200 rounded w-16"></div>
            <div className="h-3 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );
}