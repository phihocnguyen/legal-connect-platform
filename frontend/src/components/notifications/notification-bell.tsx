"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotificationUseCases } from "@/application/use-cases/notification.use-case";
import { NotificationDto } from "@/domain/entities";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const router = useRouter();
  const { notifications, unreadCount, fetchNotifications, markAsRead } =
    useNotificationUseCases();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications(0, 5, true); // Load first 5 unread notifications
    }
  }, [isOpen, fetchNotifications]);

  const handleNotificationClick = async (notification: NotificationDto) => {
    try {
      await markAsRead(notification.id);
      setIsOpen(false);

      // For now, just mark as read - can extend later with related entity navigation
      // if (notification.relatedEntityType === 'POST') {
      //   router.push(`/forum/post/${notification.relatedEntityId}`);
      // }
    } catch (error) {
      console.error("Failed to handle notification click:", error);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);

    if (diffInMinutes < 1) return "Vừa xong";
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440)
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 font-semibold">Thông báo</div>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="cursor-pointer p-3"
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex flex-col gap-1 w-full">
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-gray-500">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-center text-blue-600"
              onClick={() => {
                setIsOpen(false);
                router.push("/notifications");
              }}
            >
              Xem tất cả thông báo
            </DropdownMenuItem>
          </>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Không có thông báo mới
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
