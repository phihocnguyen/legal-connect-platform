'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { login: loginUseCase, logout: logoutUseCase, getCurrentUser } = useAuthUseCases();

  const redirectBasedOnRole = (user: User) => {
    console.log('Redirecting user with role:', user.role);
    setTimeout(() => {
      switch (user.role) {
        case 'ADMIN':
          console.log('Redirecting to /admin');
          router.push('/admin');
          break;
        case 'LAWYER':
          router.push('/forum');
          break;
        case 'USER':
        default:
          router.push('/forum');
          break;
      }
    }, 50);
  };

  const login = async (email: string, password: string): Promise<void> => {
    await loginUseCase(email, password);
    
    // Chỉ gọi getCurrentUser một lần và redirect ngay
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        redirectBasedOnRole(currentUser);
      }
    } catch (error) {
      console.log('Failed to get user after login:', error);
    }
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
    const initializeAuth = async () => {
      if (user !== null) {
        setIsLoading(false);
        return;
      }
      
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy lần đầu mount

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
