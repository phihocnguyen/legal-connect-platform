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

  const redirectBasedOnRole = (user: User, currentPath: string = "/") => {
    const role = user.role?.toLowerCase();
    console.log(
      "Redirecting user with role:",
      user.role,
      "normalized to:",
      role
    );
    // If user is on home page, don't redirect
    if (currentPath === "/") {
      return;
    }

    switch (role) {
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

  const login = async (
    email: string,
    password: string
  ): Promise<User | null> => {
    console.log("[AUTH CONTEXT] Login started");
    await loginUseCase(email, password);
    console.log("[AUTH CONTEXT] Login use case completed");

    // Get current user and return it (don't redirect here - let caller handle it)
    try {
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
      console.log("Failed to get user after login:", error);
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
      // Backend will clear SESSIONID cookie via logout endpoint
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
      // Don't fetch user data on public paths (login, register, auth)
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

      // SESSIONID is HttpOnly so we can't check via document.cookie
      // Instead, we try to fetch current user - if it works, user is authenticated
      console.log(
        "[AUTH CONTEXT] Initializing auth by fetching current user..."
      );

      // Safety timeout to ensure isLoading is always set to false
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
