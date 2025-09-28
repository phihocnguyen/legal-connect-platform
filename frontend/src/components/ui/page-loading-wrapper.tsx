'use client';

import { ReactNode } from 'react';
import { Button } from './button';

interface PageLoadingWrapperProps {
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function PageLoadingWrapper({ 
  children, 
  isLoading,
  error,
  onRetry 
}: PageLoadingWrapperProps) {

  if (error) {
    return (
      <div className="container mx-auto py-8 animate-fade-in">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          {onRetry && (
            <Button onClick={onRetry}>
              Thử lại
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return null; // Let global loading indicator handle it
  }

  return <>{children}</>;
}