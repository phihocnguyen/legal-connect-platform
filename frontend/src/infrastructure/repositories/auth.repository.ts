import { AuthRepository } from "../../domain/interfaces/repositories";
import { User } from "../../domain/entities";
import { apiClient } from "../../lib/axiosInstance";

export class HttpAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<{ user: User }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: User;
    }>("/auth/login", {
      email,
      password,
    });
    console.log("[AUTH REPO] Login response:", response.data);

    const user = response.data.data;
    if (user) {
      user.role = (user.role as string).toLowerCase() as typeof user.role;
    }

    console.log("[AUTH REPO] Extracted user:", user);
    return { user };
  }

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ user: User }> {
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: User;
    }>("/auth/register", userData);
    console.log("[AUTH REPO] Register response:", response.data);

    const user = response.data.data;
    if (user) {
      user.role = (user.role as string).toLowerCase() as typeof user.role;
    }

    console.log("[AUTH REPO] Extracted user:", user);
    return { user };
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      console.log("[AUTH REPO] Fetching current user...");
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: User;
      }>("/auth/me");
      console.log("[AUTH REPO] getCurrentUser response:", response.data);

      const user = response.data.data;
      if (user) {
        user.role = (user.role as string).toLowerCase() as typeof user.role;
        console.log("[AUTH REPO] Normalized user role to lowercase:", user);
      }

      console.log("[AUTH REPO] Extracted user from getCurrentUser:", user);
      return user;
    } catch (error) {
      console.error("[AUTH REPO] getCurrentUser error:", error);
      return null;
    }
  }
}
