"use client";

import { useEffect, useState } from "react";
import { useNotificationUseCases } from "@/application/use-cases/notification.use-case";
import { NotificationDto } from "@/domain/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Check, CheckCheck } from "lucide-react";
import { getTimeAgo } from "@/lib/date-utils";

export default function NotificationsPage() {
  const {
    notifications,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotificationUseCases();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    fetchNotifications(0, 50, filter === "unread" ? true : undefined);
  }, [filter, fetchNotifications]);

  const handleNotificationClick = async (notification: NotificationDto) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "MENTION":
        return "👤";
      case "REPLY":
        return "💬";
      case "UPVOTE":
        return "👍";
      default:
        return "🔔";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={loading}
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            onClick={() => setFilter("unread")}
          >
            Chưa đọc
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-lg border border-gray-200 bg-white animate-pulse"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  notification.isRead
                    ? "bg-white border-gray-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm ${
                        notification.isRead
                          ? "text-gray-700"
                          : "text-gray-900 font-medium"
                      }`}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {getTimeAgo(notification.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <Badge variant="secondary" className="text-xs">
                          Mới
                        </Badge>
                      )}
                    </div>
                  </div>
                  {notification.isRead && (
                    <Check className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Không có thông báo</p>
            <p className="text-gray-400 text-sm mt-2">
              {filter === "unread"
                ? "Bạn đã đọc tất cả thông báo"
                : "Chưa có thông báo nào"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
