import { AuthRepository } from '../../domain/interfaces/repositories';
import { User } from '../../domain/entities';
import { apiClient } from '../../lib/axiosInstance';

export class HttpAuthRepository implements AuthRepository {

  async login(email: string, password: string): Promise<{ user: User }> {
    const response = await apiClient.post<{ user: User }>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ user: User }> {
    const response = await apiClient.post<{ user: User }>('/auth/register', userData);
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }
}
