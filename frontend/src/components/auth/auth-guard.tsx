'use client';

import { useAuth } from '@/contexts/auth-context';
import { LoadingSpinner } from '../ui/loading-spinner';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
        <LoadingSpinner size="lg" text="Đang tải..." />
      </div>
    );
  }

  return <>{children}</>;
}
