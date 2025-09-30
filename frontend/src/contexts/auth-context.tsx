'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/domain/entities';
import { useAuthUseCases } from '@/hooks/use-auth-cases';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { login: loginUseCase, logout: logoutUseCase, getCurrentUser } = useAuthUseCases();

  const login = async (email: string, password: string): Promise<void> => {
    await loginUseCase(email, password);
    await refreshUser();
  };

  const logout = async (): Promise<void> => {
    await logoutUseCase();
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log('Failed to get current user:', error);
      setUser(null);
    }
  };

  useEffect(() => {
    if (user !== null) {
      setIsLoading(false);
      return;
    }
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, [getCurrentUser, user]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
