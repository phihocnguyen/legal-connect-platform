"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SubCategoryItem {
  id: number;
  name: string;
  slug: string;
  description?: string;
  threadsCount?: number;
  postsCount?: number;
}

interface CategoryWithSubProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  threads: number;
  posts: number;
  subCategories?: SubCategoryItem[];
  lastPost?: {
    id: number;
    title: string;
    authorName: string;
    authorRole: string;
    authorAvatar?: string;
    categoryName: string;
    views?: number;
    createdAt: string;
  };
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function CategoryWithSub({
  id,
  name,
  description,
  icon,
  threads,
  posts,
  subCategories = [],
  lastPost,
}: CategoryWithSubProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  return (
    <div className="space-y-2">
      {/* Main Category */}
      <div
        className="block cursor-pointer"
        onClick={() => router.push(`/forum/${id}`)}
      >
        <div className="relative bg-white hover:bg-slate-50 transition-all duration-300 py-4 border-b border-slate-200 hover:border-slate-300">
          <div className="relative px-6">
            <div className="flex items-center gap-6 justify-between">
              {/* Left: Forum name with icon and description */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 rounded-lg bg-slate-100 flex items-center justify-center text-3xl shadow-none group-hover:bg-slate-200 transition-all duration-300">
                    {icon}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                    {name}
                  </h3>
                  {description && (
                    <p className="text-gray-600 text-sm line-clamp-1">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {/* Center: Topics count */}
              <div className="flex-shrink-0 text-center min-w-24">
                <div className="text-base font-bold text-gray-900">
                  {threads}
                </div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>

              {/* Center: Posts count */}
              <div className="flex-shrink-0 text-center min-w-24">
                <div className="text-base font-bold text-gray-900">{posts}</div>
                <div className="text-sm text-gray-500">Messages</div>
              </div>

              {/* Right: Last post info */}
              <div className="flex-shrink-0 w-64 flex gap-2.5">
                {lastPost ? (
                  <div
                    className="flex gap-2.5 items-start cursor-pointer hover:opacity-80 transition-opacity w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/forum/posts/${lastPost.id}`);
                    }}
                  >
                    {/* Left: Avatar */}
                    <div className="flex-shrink-0">
                      <div
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold overflow-hidden"
                        style={{
                          backgroundImage: lastPost.authorAvatar
                            ? `url(${lastPost.authorAvatar})`
                            : undefined,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                        }}
                        title={lastPost.authorName}
                      >
                        {!lastPost.authorAvatar &&
                          lastPost.authorName.charAt(0).toUpperCase()}
                      </div>
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      {/* Title */}
                      <p
                        className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1 overflow-hidden text-ellipsis"
                        title={lastPost.title}
                      >
                        {lastPost.title}
                      </p>

                      {/* Author and Date below title */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span
                          className="text-gray-700 font-medium truncate max-w-[100px]"
                          title={lastPost.authorName}
                        >
                          {lastPost.authorName}
                        </span>
                        {lastPost.createdAt && (
                          <>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500 whitespace-nowrap">
                              {formatDate(lastPost.createdAt)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No posts yet</p>
                )}
              </div>

              {/* Expand button for sub-categories */}
              {subCategories.length > 0 && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                  }}
                  className="ml-2 p-1"
                >
                  <ChevronDown
                    size={20}
                    className={`text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Categories */}
      {isExpanded && subCategories.length > 0 && (
        <div className="ml-8 space-y-1 border-l-2 border-slate-200 pl-4">
          {subCategories.map((subCat) => (
            <Link
              key={subCat.id}
              href={`/forum/${subCat.slug}`}
              className="block group"
            >
              <div className="py-2 px-3 rounded hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                      {subCat.name}
                    </h4>
                    {subCat.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                        {subCat.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-xs text-gray-500">
                    <span className="inline-block">
                      {subCat.threadsCount || 0} topics
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
