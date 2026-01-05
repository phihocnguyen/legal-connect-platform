"use client";

import React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Bell, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useNotificationUseCases } from "@/application/use-cases/notification.use-case";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount } = useNotificationUseCases();

  const isAdmin = (role: string): boolean => {
    return role?.toLowerCase() === "admin";
  };

  const getInitials = (name: string) => {
    return (
      name &&
      name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    );
  };

  useEffect(() => {
    if (!isLoading) {
      console.log(
        "[AdminLayout] Checking access - User:",
        user?.email,
        "Role:",
        user?.role,
        "IsAdmin:",
        user ? isAdmin(user.role) : false
      );
      if (!user || !isAdmin(user.role)) {
        console.log("[AdminLayout] Access denied, redirecting to home");
        router.push("/");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Truy cập bị từ chối
          </h1>
          <p className="text-gray-600">
            Bạn không có quyền truy cập vào trang này.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-20">
          <h1 className="text-lg font-semibold text-gray-800">
            {pathname === "/admin" ? "Dashboard" : "Quản trị hệ thống"}
          </h1>
          <div className="flex items-center space-x-4">
            <NotificationBell />
            <div className="h-8 w-px bg-gray-200 mx-1" />
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 border border-gray-200">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900 leading-none">
                  {user.fullName}
                </span>
                <span className="text-xs text-blue-600 font-medium">ADMIN</span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <div className="p-6 max-w-full overflow-x-hidden">{children}</div>
        </main>
      </div>
    </div>
  );
}
