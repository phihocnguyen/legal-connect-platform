"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePathname } from "next/navigation";
import { LoadingSpinner } from "../ui/loading-spinner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  // Always show loading spinner during auth initialization
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  // For auth pages (login, register), always show content
  if (pathname?.startsWith("/auth")) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
