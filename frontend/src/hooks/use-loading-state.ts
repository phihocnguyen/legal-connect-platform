import { useCallback, useEffect } from 'react';
import { useLoading } from '@/contexts/loading-context';

export function useLoadingState() {
  const { setLoading, clearLoading, loadingState } = useLoading();

  const startLoading = useCallback((message?: string) => {
    setLoading(true, message);
  }, [setLoading]);

  const stopLoading = useCallback(() => {
    setLoading(false);
  }, [setLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLoading();
    };
  }, [clearLoading]);

  return {
    startLoading,
    stopLoading,
    isLoading: loadingState.isLoading
  };
}

// Hook for async operations
export function useAsyncOperation() {
  const { setLoading } = useLoading();
  
  const runWithLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    message?: string
  ): Promise<T> => {
    try {
      setLoading(true, message);
      const result = await operation();
      return result;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  return { runWithLoading };
}