'use client';

import { useLoading } from '@/contexts/loading-context';
import { LoadingSpinner } from './loading-spinner';

export function GlobalLoadingIndicator() {
  const { loadingState } = useLoading();

  if (!loadingState.isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <LoadingSpinner size="lg" text="Đang tải..." />
    </div>
  );
}