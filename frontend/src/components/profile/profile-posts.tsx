import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Eye, Calendar } from "lucide-react";
import { UserProfile, PostDto } from "@/domain/entities";
import { UserPost } from "@/domain/entities/user";

interface ProfilePostsProps {
  posts: PostDto[] | UserPost[];
  user: UserProfile;
}

export function ProfilePosts({ posts, user }: ProfilePostsProps) {
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

  // Mock posts if empty
  const mockPosts = posts.length === 0 ? [] : posts;

  // Helper function to check if post is UserPost
  const isUserPost = (post: PostDto | UserPost): post is UserPost => {
    return "categoryName" in post;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Bài viết của {user.fullName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mockPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có bài viết nào</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mockPosts.map((post) => {
              const categoryName = isUserPost(post)
                ? post.categoryName
                : post.category?.name;
              const categorySlug = isUserPost(post)
                ? post.categorySlug
                : post.category?.slug;

              return (
                <div
                  key={post.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={user.avatar || undefined}
                        alt={user.fullName}
                      />
                      <AvatarFallback>
                        {user.fullName?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {(() => {
                          const postSlug =
                            "slug" in post ? (post as PostDto).slug : undefined;
                          return (
                            <Link
                              href={`/forum/${categorySlug}/${
                                postSlug || post.id
                              }`}
                              className="text-lg font-semibold text-gray-900 hover:text-[#004646] line-clamp-1"
                            >
                              {post.title}
                            </Link>
                          );
                        })()}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        {categoryName && (
                          <Badge
                            variant="secondary"
                            className="bg-blue-100 text-blue-800"
                          >
                            {categoryName}
                          </Badge>
                        )}
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.replyCount} phản hồi</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{post.views} lượt xem</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
