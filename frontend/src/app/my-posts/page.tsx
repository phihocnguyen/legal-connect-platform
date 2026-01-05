"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useLoadingState } from "@/hooks/use-loading-state";
import { useAuth } from "@/contexts/auth-context";
import { PostDto } from "@/domain/entities";
import { MessageSquare, Eye, BookmarkX } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

export default function MyPostsPage() {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"myPosts" | "bookmarks">("myPosts");
  const [myPosts, setMyPosts] = useState<PostDto[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { startLoading, stopLoading } = useLoadingState();

  const loadMyPosts = useCallback(async () => {
    try {
      startLoading("Đang tải bài viết của bạn...");
      const response = await axiosInstance.get("/forum/posts", {
        params: {
          page: 0,
          size: 100, // Get more to filter
          sort: "createdAt,desc",
        },
      });
      const userPosts = (response.data.content || []).filter(
        (post: PostDto) => post.author.id === user?.id
      );
      setMyPosts(userPosts);
    } catch (error) {
      console.error("Error loading my posts:", error);
      toast.error("Không thể tải bài viết của bạn");
    } finally {
      stopLoading();
    }
  }, [user?.id, startLoading, stopLoading]);

  const loadBookmarkedPosts = useCallback(async () => {
    try {
      startLoading("Đang tải bài viết đã lưu...");
      const response = await axiosInstance.get("/forum/bookmarks", {
        params: {
          page: 0,
          size: 20,
          sort: "createdAt,desc",
        },
      });
      setBookmarkedPosts(response.data.data?.content || response.data.content || []);
    } catch (error) {
      console.error("Error loading bookmarked posts:", error);
      toast.error("Không thể tải bài viết đã lưu");
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);

  useEffect(() => {
    if (!isAuthenticated) return;
    setLoading(true);
    Promise.all([loadMyPosts(), loadBookmarkedPosts()]).finally(() => {
      setLoading(false);
    });
  }, [isAuthenticated, loadMyPosts, loadBookmarkedPosts]);

  const handleRemoveBookmark = async (postId: number) => {
    try {
      await axiosInstance.delete(`/forum/posts/${postId}/bookmark`);
      setBookmarkedPosts(bookmarkedPosts.filter((p) => p.id !== postId));
      toast.success("Đã xóa khỏi danh sách lưu");
    } catch (error) {
      console.error("Error removing bookmark:", error);
      toast.error("Không thể xóa khỏi danh sách lưu");
    }
  };

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

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vui lòng đăng nhập để xem bài viết của bạn</p>
          <Link href="/login">
            <Button className="bg-[#004646] hover:bg-[#005555]">Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const posts = activeTab === "myPosts" ? myPosts : bookmarkedPosts;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-[#004646]">
            Trang chủ
          </Link>
          <span>→</span>
          <span className="text-gray-900">Bài viết của tôi</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài viết của tôi</h1>
          <p className="text-gray-600">Quản lý bài viết và danh sách lưu của bạn</p>
        </div>

        {/* Tabs */}
        <Card className="shadow-sm border-gray-200 mb-8">
          <CardHeader className="border-b">
            <div className="flex gap-4">
              <Button
                variant={activeTab === "myPosts" ? "default" : "ghost"}
                className={
                  activeTab === "myPosts"
                    ? "bg-[#004646] hover:bg-[#005555] text-white"
                    : "text-gray-600 hover:text-[#004646]"
                }
                onClick={() => setActiveTab("myPosts")}
              >
                Bài viết của tôi ({myPosts.length})
              </Button>
              <Button
                variant={activeTab === "bookmarks" ? "default" : "ghost"}
                className={
                  activeTab === "bookmarks"
                    ? "bg-[#004646] hover:bg-[#005555] text-white"
                    : "text-gray-600 hover:text-[#004646]"
                }
                onClick={() => setActiveTab("bookmarks")}
              >
                Đã lưu ({bookmarkedPosts.length})
              </Button>
            </div>
          </CardHeader>

          {/* Posts List */}
          <CardContent className="p-0">
            {posts.length > 0 ? (
              <div className="divide-y">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/forum/${post.category.slug}/${post.slug}`}
                    className="block p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                        <AvatarFallback>{post.author.name?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
                            {post.title}
                          </div>
                          {activeTab === "bookmarks" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                handleRemoveBookmark(post.id);
                              }}
                              className="text-gray-400 hover:text-red-500 flex-shrink-0"
                            >
                              <BookmarkX className="w-5 h-5" />
                            </Button>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-3">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {post.category.name}
                          </Badge>
                          <span className="text-gray-600">{post.author.name}</span>
                          <span className="text-gray-500">{formatDate(post.createdAt)}</span>
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
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                <p className="mb-2">
                  {activeTab === "myPosts" ? "Bạn chưa có bài viết nào" : "Bạn chưa lưu bài viết nào"}
                </p>
                {activeTab === "myPosts" && (
                  <Link href="/forum/new">
                    <Button className="bg-[#004646] hover:bg-[#005555] text-white mt-4">
                      Tạo bài viết mới
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
