"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  Users,
  Scale,
  BarChart3,
  AlertTriangle,
  LogOut,
  FolderOpen,
  Flag,
  Shield,
  LineChart,
} from "lucide-react";

interface AdminSidebarProps {
  className?: string;
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  {
    title: "Tổng quan",
    href: "/admin",
    icon: BarChart3,
    description: "Dashboard và thống kê tổng quan",
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
    icon: Users,
    description: "Danh sách và quản lý tất cả người dùng",
  },
  {
    title: "Quản lý luật sư",
    href: "/admin/lawyers",
    icon: Scale,
    description: "Duyệt đơn đăng ký và quản lý luật sư",
  },
  {
    title: "Quản lý bài viết",
    href: "/admin/posts",
    icon: Flag,
    description: "Xem và xử lý báo cáo bài viết từ người dùng",
  },
  {
    title: "Báo cáo vi phạm",
    href: "/admin/violations",
    icon: AlertTriangle,
    description: "Kiểm duyệt và xử lý báo cáo vi phạm",
  },
  {
    title: "Danh mục pháp luật",
    href: "/admin/categories",
    icon: FolderOpen,
    description: "Quản lý danh mục pháp luật",
  },
  {
    title: "Báo cáo & Phân tích",
    href: "/admin/analytics",
    icon: LineChart,
    description: "Xem báo cáo và insights chi tiết",
  },
];

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isItemActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 w-64 bg-white border-r border-gray-200 h-screen flex flex-col",
        className
      )}
    >
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">Legal Connect</p>
          </div>
        </div>
      </div>

      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {sidebarItems.map((item) => (
          <div key={item.href}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isItemActive(item.href)
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isItemActive(item.href) ? "text-blue-600" : "text-gray-400"
                )}
              />
              <span>{item.title}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200 flex-shrink-0">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </Button>
      </div>
    </aside>
  );
}
