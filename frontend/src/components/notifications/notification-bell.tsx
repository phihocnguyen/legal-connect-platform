"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotificationUseCases } from "@/application/use-cases/notification.use-case";
import { NotificationDto } from "@/domain/entities";
import { useRouter } from "next/navigation";
import { getTimeAgo } from "@/lib/date-utils";
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
  const { notifications, unreadCount, fetchNotifications, markAsRead, loading } =
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

    } catch (error) {
      console.error("Failed to handle notification click:", error);
    }
  };

  const truncateMessage = (message: string, maxLength: number = 60) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full cursor-pointer p-0"
        >
          <Bell className="w-7 h-7" />
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
        {loading ? (
          <div className="space-y-2 p-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-3 animate-pulse">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-gray-200 rounded-full mt-1.5"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-1">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`cursor-pointer p-3 ${
                  !notification.isRead 
                    ? "bg-teal-50 hover:bg-teal-100" 
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-2 w-full">
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-teal-600 rounded-full mt-1.5 flex-shrink-0" />
                  )}
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <p className={`text-sm line-clamp-2 ${
                      !notification.isRead 
                        ? "text-gray-900 font-semibold" 
                        : "text-gray-500"
                    }`}>
                      {truncateMessage(notification.message)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getTimeAgo(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Không có thông báo mới
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
