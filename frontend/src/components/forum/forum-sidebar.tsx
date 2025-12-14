"use client";
import { Card } from "@/components/ui/card";
import { OnlineUserList } from "./online-users";
import useOnlineUserStore from "@/stores/online-user-store";
import { useState, useEffect } from "react";
import { useWebSocketStore } from "@/stores/web-socket-store";
import { useForumUseCases } from "@/hooks/use-forum-cases";
import {
  ForumStatsDto,
  PopularTopicDto,
  CategoryStatsDto,
  PopularTagDto,
} from "@/domain/entities";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export function ForumSidebar() {
  const { fetchOnlineUsers, onlineUsers } = useOnlineUserStore();
  const { connected } = useWebSocketStore();
  const getOnlineUsers = useWebSocketStore((s) => s.getOnlineUsers);
  const router = useRouter();

  // Forum statistics hooks
  const { getForumStats, getPopularTopics, getCategoryStats, getPopularTags } =
    useForumUseCases();

  // State for forum data
  const [stats, setStats] = useState<ForumStatsDto | null>(null);
  const [popularTopics, setPopularTopics] = useState<PopularTopicDto[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStatsDto[]>([]);
  const [popularTags, setPopularTags] = useState<PopularTagDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (connected) fetchOnlineUsers(getOnlineUsers);
  }, [connected, fetchOnlineUsers, getOnlineUsers]);

  useEffect(() => {
    if (dataLoaded) return;

    const loadForumData = async () => {
      try {
        setLoading(true);
        const [statsData, topicsData, categoriesData, tagsData] =
          await Promise.all([
            getForumStats(),
            getPopularTopics(5),
            getCategoryStats(),
            getPopularTags(10),
          ]);

        setStats(statsData);
        setPopularTopics(topicsData);
        setCategoryStats(categoriesData.slice(0, 5));
        setPopularTags(tagsData.slice(0, 6));
        setDataLoaded(true);
      } catch (error) {
        console.error("Error loading forum statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    loadForumData();
  }, [
    dataLoaded,
    getForumStats,
    getPopularTopics,
    getCategoryStats,
    getPopularTags,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCreateTopic = () => {
    router.push("/forum/new");
  };

  return (
    <div className="space-y-6">
      {/* Search and Create Topic Box */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Tìm kiếm chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            type="button"
            onClick={handleCreateTopic}
            className="w-full bg-[#004646] hover:bg-[#003333] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tạo chủ đề mới
          </Button>
        </form>
      </Card>

      <OnlineUserList userList={onlineUsers} />

      {/* Chủ đề phổ biến */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Chủ đề phổ biến</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Đang tải...</div>
        ) : (
          <ul className="space-y-2">
            {popularTopics.map((topic) => (
              <li key={topic.id} className="text-sm">
                <Link
                  href={`/forum/${topic.categorySlug}/${topic.slug}`}
                  className="text-[#004646] hover:underline flex items-center gap-2"
                >
                  <span className="flex-1 truncate">{topic.title}</span>
                  {topic.badge && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                        topic.badge === "hot"
                          ? "bg-red-100 text-red-600"
                          : topic.badge === "solved"
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {topic.badge === "hot"
                        ? "🔥"
                        : topic.badge === "solved"
                        ? "✓"
                        : "📈"}
                    </span>
                  )}
                </Link>
                <div className="text-xs text-gray-500 mt-0.5">
                  {topic.views} lượt xem • {topic.replyCount} trả lời
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Chuyên mục sôi nổi */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Chuyên mục sôi nổi</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Đang tải...</div>
        ) : (
          <ul className="space-y-2">
            {categoryStats.map((category) => (
              <li
                key={category.id}
                className="flex justify-between items-center text-sm"
              >
                <Link
                  href={`/forum/${category.slug}`}
                  className="text-[#004646] hover:underline flex items-center gap-1"
                >
                  {category.icon && <span>{category.icon}</span>}
                  <span>{category.name}</span>
                </Link>
                <span className="text-gray-500">{category.topicCount}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Thống kê nhanh */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Thống kê nhanh</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Đang tải...</div>
        ) : stats ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Chủ đề mới hôm nay:</span>
              <span className="font-medium">{stats.topicsToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Bài viết mới hôm nay:</span>
              <span className="font-medium">{stats.postsToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thành viên mới hôm nay:</span>
              <span className="font-medium">{stats.membersToday}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between text-gray-500">
                <span>Tổng chủ đề:</span>
                <span>{stats.totalTopics}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tổng bài viết:</span>
                <span>{stats.totalPosts}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Tổng thành viên:</span>
                <span>{stats.totalMembers}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Không có dữ liệu</div>
        )}
      </Card>

      {/* Tags phổ biến */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Tags phổ biến</h3>
        {loading ? (
          <div className="text-sm text-gray-500">Đang tải...</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {popularTags.map((tag) => (
              <Link
                key={tag.tag}
                href={`/forum/search?tag=${encodeURIComponent(tag.tag)}`}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-sm rounded-full transition-colors"
                title={`${tag.count} bài viết`}
              >
                {tag.tag}
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
