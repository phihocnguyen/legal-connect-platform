"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/domain/entities";
import { useAuthUseCases } from "@/hooks/use-auth-cases";

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
  const {
    login: loginUseCase,
    logout: logoutUseCase,
    getCurrentUser,
  } = useAuthUseCases();

  const redirectBasedOnRole = (user: User, currentPath: string = "/") => {
    console.log("Redirecting user with role:", user.role);
    // If user is on home page, don't redirect
    if (currentPath === "/") {
      return;
    }

    switch (user.role) {
      case "admin":
        console.log("Redirecting to /admin");
        router.push("/admin");
        break;
      case "lawyer":
      case "user":
      default:
        router.push("/forum");
        break;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    await loginUseCase(email, password);

    // Get current user and redirect
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const currentPath =
          typeof window !== "undefined" ? window.location.pathname : "/";
        redirectBasedOnRole(currentUser, currentPath);
      }
    } catch (error) {
      console.log("Failed to get user after login:", error);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await logoutUseCase();
      setUser(null);
      // Redirect to homepage after logout
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear user state even if API fails
      setUser(null);
      router.push("/");
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
      // Check if there's a LOGGED_IN cookie
      const hasLoggedInCookie =
        typeof window !== "undefined" &&
        document.cookie
          .split("; ")
          .some((cookie) => cookie.startsWith("LOGGED_IN=true"));

      // If no cookie, skip API call (visitor/logged out)
      if (!hasLoggedInCookie) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      // Has cookie - try to fetch user data
      try {
        const currentUser = await getCurrentUser();
        if (isMounted) {
          if (currentUser) {
            setUser(currentUser);
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        console.log("Failed to fetch current user:", error);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
