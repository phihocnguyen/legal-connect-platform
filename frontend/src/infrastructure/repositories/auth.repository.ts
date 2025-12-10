import { AuthRepository } from "../../domain/interfaces/repositories";
import { User } from "../../domain/entities";
import { apiClient } from "../../lib/axiosInstance";

export class HttpAuthRepository implements AuthRepository {
  async login(email: string, password: string): Promise<{ user: User }> {
    // Response format: { success: boolean, message: string, data: AuthResponse }
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: User;
    }>("/auth/login", {
      email,
      password,
    });
    console.log("[AUTH REPO] Login response:", response.data);
    console.log("[AUTH REPO] Extracted user:", response.data.data);
    return { user: response.data.data };
  }

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ user: User }> {
    // Response format: { success: boolean, message: string, data: AuthResponse }
    const response = await apiClient.post<{
      success: boolean;
      message: string;
      data: User;
    }>("/auth/register", userData);
    console.log("[AUTH REPO] Register response:", response.data);
    console.log("[AUTH REPO] Extracted user:", response.data.data);
    return { user: response.data.data };
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
      // Response format: { success: boolean, message: string, data: User }
      const response = await apiClient.get<{
        success: boolean;
        message: string;
        data: User;
      }>("/auth/me");
      console.log("[AUTH REPO] getCurrentUser response:", response.data);
      console.log(
        "[AUTH REPO] Extracted user from getCurrentUser:",
        response.data.data
      );
      return response.data.data;
    } catch (error) {
      console.error("[AUTH REPO] getCurrentUser error:", error);
      // Session expired or user not authenticated
      // Backend will clear SESSIONID cookie via 401 response headers
      return null;
    }
  }
}
