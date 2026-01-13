"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLoadingState } from "@/hooks/use-loading-state";
import { useAuth } from "@/contexts/auth-context";
import { PostDto } from "@/domain/entities";
import { MessageSquare, Eye, BookmarkX } from "lucide-react";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

export default function MyPostsPage() {
  const { user, isAuthenticated } = useAuth();
  const { startLoading, stopLoading } = useLoadingState();
  const [activeTab, setActiveTab] = useState<"myPosts" | "bookmarks">("myPosts");
  const [myPosts, setMyPosts] = useState<PostDto[]>([]);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<PostDto[]>([]);

  const loadMyPosts = useCallback(async () => {
    try {
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
    }
  }, [user?.id, startLoading, stopLoading]);

  const loadBookmarkedPosts = useCallback(async () => {
    try {
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
    }
  }, [startLoading, stopLoading]);

  useEffect(() => {
    if (!isAuthenticated) return;
    startLoading("Đang tải bài viết...");
    Promise.all([loadMyPosts(), loadBookmarkedPosts()]).finally(() => {
      stopLoading();
    });
  }, [isAuthenticated, loadMyPosts, loadBookmarkedPosts, startLoading, stopLoading]);

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
        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === "myPosts" ? "default" : "ghost"}
            className={`rounded-full px-6 h-11 transition-all ${
              activeTab === "myPosts"
                ? "bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("myPosts")}
          >
            Bài viết của tôi ({myPosts.length})
          </Button>
          <Button
            variant={activeTab === "bookmarks" ? "default" : "ghost"}
            className={`rounded-full px-6 h-11 transition-all ${
              activeTab === "bookmarks"
                ? "bg-teal-600 hover:bg-teal-700 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab("bookmarks")}
          >
            Đã lưu ({bookmarkedPosts.length})
          </Button>
        </div>

        <Card className="shadow-sm border-gray-200">

          {/* Posts List */}
          <CardContent className="p-6">
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="group relative bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all overflow-hidden"
                  >
                    <Link
                      href={`/forum/${post.category.slug}/${post.slug}`}
                      className="block p-5"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12 ring-2 ring-gray-100 flex-shrink-0">
                          <AvatarImage src={post.author.avatar || undefined} alt={post.author.name} />
                          <AvatarFallback className="bg-teal-100 text-teal-700 font-medium">
                            {post.author.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-teal-600 line-clamp-2 flex-1 transition-colors">
                              {post.title}
                            </h3>
                            {activeTab === "bookmarks" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleRemoveBookmark(post.id);
                                }}
                                className="text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0 h-8 w-8 p-0 rounded-full"
                              >
                                <BookmarkX className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm mb-3">
                            <Badge variant="secondary" className="bg-teal-100 text-teal-700 border-teal-200 font-medium">
                              {post.category.name}
                            </Badge>
                            <span className="text-gray-600 font-medium">{post.author.name}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">{formatRelativeTime(post.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-5 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{post.replyCount}</span>
                              <span className="text-gray-400">phản hồi</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Eye className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{post.views}</span>
                              <span className="text-gray-400">lượt xem</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-gray-500">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  {activeTab === "myPosts" ? (
                    <MessageSquare className="w-10 h-10 text-gray-400" />
                  ) : (
                    <BookmarkX className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "myPosts" ? "Chưa có bài viết nào" : "Chưa lưu bài viết nào"}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {activeTab === "myPosts" 
                    ? "Bắt đầu chia sẻ kiến thức và kinh nghiệm của bạn"
                    : "Lưu các bài viết hữu ích để đọc lại sau"}
                </p>
                {activeTab === "myPosts" && (
                  <Link href="/forum">
                    <Button className="bg-teal-600 hover:bg-teal-700 text-white">
                      Khám phá diễn đàn
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
