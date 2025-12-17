"use client";

import React from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = (role: string): boolean => {
    return role?.toLowerCase() === "admin";
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
      <main className="ml-64 min-h-screen w-[calc(100%-16rem)]">
        <div className="p-6 max-w-full overflow-x-hidden">{children}</div>
      </main>
    </div>
  );
}
