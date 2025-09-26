'use client'
import { Card } from "@/components/ui/card";
import { OnlineUserList } from "./online-users";
import useOnlineUserStore from "@/stores/online-user-store";
import { useEffect } from "react";
import { useWebSocketStore } from "@/stores/web-socket-store";
export function ForumSidebar() {
  const {fetchOnlineUsers, onlineUsers, loading, error} = useOnlineUserStore()
  const {connected} = useWebSocketStore()
  const getOnlineUsers = useWebSocketStore((s) => s.getOnlineUsers);
  const popularTopics = [
    "Thủ tục ly hôn thuận tình",
    "Tranh chấp đất đai",
    "Quyền thừa kế",
    "Bảo vệ quyền lợi người lao động",
    "Thành lập doanh nghiệp"
  ];

  useEffect(() => {
    if(connected) fetchOnlineUsers(getOnlineUsers);
  }, [connected, fetchOnlineUsers, getOnlineUsers]);

  const activeCategories = [
    { name: "Luật Dân sự", posts: 156 },
    { name: "Luật Đất đai", posts: 134 },
    { name: "Luật Lao động", posts: 98 },
    { name: "Luật Hình sự", posts: 87 },
    { name: "Luật Kinh doanh", posts: 76 }
  ];

  return (
    <div className="space-y-6">
      <OnlineUserList userList={onlineUsers}/>
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Chủ đề phổ biến</h3>
        <ul className="space-y-2">
          {popularTopics.map((topic, index) => (
            <li key={index} className="text-sm">
              <a href="#" className="text-[#004646] hover:underline">
                {topic}
              </a>
            </li>
          ))}
        </ul>
      </Card>

      {/* Chuyên mục sôi nổi */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Chuyên mục sôi nổi</h3>
        <ul className="space-y-2">
          {activeCategories.map((category, index) => (
            <li key={index} className="flex justify-between items-center text-sm">
              <a href="#" className="text-[#004646] hover:underline">
                {category.name}
              </a>
              <span className="text-gray-500">{category.posts}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Thống kê nhanh */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Thống kê nhanh</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Chủ đề mới hôm nay:</span>
            <span className="font-medium">45</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Bài viết mới hôm nay:</span>
            <span className="font-medium">234</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Thành viên mới hôm nay:</span>
            <span className="font-medium">12</span>
          </div>
        </div>
      </Card>

      {/* Tags phổ biến */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Tags phổ biến</h3>
        <div className="flex flex-wrap gap-2">
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">ly hôn</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">thừa kế</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">đất đai</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">hợp đồng</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">lao động</span>
          <span className="px-2 py-1 bg-gray-100 text-sm rounded-full">tranh chấp</span>
        </div>
      </Card>
    </div>
  );
}
