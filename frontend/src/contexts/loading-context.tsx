'use client';

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

interface LoadingState {
  isLoading: boolean;
  message?: string;
}

interface LoadingContextType {
  loadingState: LoadingState;
  setLoading: (loading: boolean, message?: string) => void;
  clearLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [currentState, setCurrentState] = useState<LoadingState>({
    isLoading: false,
  });

  const setLoading = useCallback((loading: boolean, message?: string) => {
    if (loading) {
      setCurrentState({ isLoading: true, message: message || 'Đang tải...' });
    } else {
      setCurrentState({ isLoading: false });
    }
  }, []);

  const clearLoading = useCallback(() => {
    setCurrentState({ isLoading: false });
  }, []);

  const contextValue = useMemo(() => ({
    loadingState: currentState,
    setLoading,
    clearLoading
  }), [currentState, setLoading, clearLoading]);

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}