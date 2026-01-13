"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/domain/entities";
import { useAuthUseCases } from "@/hooks/use-auth-cases";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const {
    login: loginUseCase,
    logout: logoutUseCase,
    getCurrentUser,
  } = useAuthUseCases();

  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    console.log("[AUTH CONTEXT] Login started");
    
    try {
      await loginUseCase(email, password);
      console.log("[AUTH CONTEXT] Login use case completed");

      const currentUser = await getCurrentUser();
      console.log("[AUTH CONTEXT] getCurrentUser returned:", currentUser);
      if (currentUser) {
        console.log("[AUTH CONTEXT] Setting user:", currentUser);
        setUser(currentUser);
        return currentUser;
      } else {
        console.log("[AUTH CONTEXT] getCurrentUser returned null");
        return null;
      }
    } catch (error) {
      console.log("[AUTH CONTEXT] Login failed:", error);
      // Return null but don't set user, let the calling component handle the error
      return null;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUseCase();
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      setUser(null);
      router.push("/login");
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.log("Failed to get current user:", error);
      setUser(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const currentPath =
        typeof window !== "undefined" ? window.location.pathname : "";
      const publicPaths = ["/login", "/register", "/auth"];
      const isPublicPath = publicPaths.some((path) =>
        currentPath.startsWith(path)
      );

      if (isPublicPath) {
        console.log(
          "[AUTH CONTEXT] On public path:",
          currentPath,
          "- skipping auth initialization"
        );
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      console.log(
        "[AUTH CONTEXT] Initializing auth by fetching current user..."
      );

      const timeoutId = setTimeout(() => {
        if (isMounted) {
          console.log(
            "[AUTH CONTEXT] Auth initialization timeout - setting isLoading to false"
          );
          setIsLoading(false);
        }
      }, 5000);

      try {
        const currentUser = await getCurrentUser();
        console.log("[AUTH CONTEXT] getCurrentUser returned:", currentUser);
        console.log(
          "[AUTH CONTEXT] User role from backend:",
          currentUser?.role
        );
        clearTimeout(timeoutId);
        if (isMounted) {
          if (currentUser) {
            console.log(
              "[AUTH CONTEXT] User authenticated, setting user:",
              currentUser
            );
            setUser(currentUser);
          } else {
            console.log(
              "[AUTH CONTEXT] getCurrentUser returned null - user not authenticated"
            );
            setUser(null);
          }
        }
      } catch (error) {
        console.log("[AUTH CONTEXT] Failed to fetch current user:", error);
        clearTimeout(timeoutId);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          console.log("[AUTH CONTEXT] Auth initialization complete");
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
