import { AuthRepository } from '../../domain/interfaces/repositories';
import { User } from '../../domain/entities';

export class HttpAuthRepository implements AuthRepository {
  private apiUrl = process.env.NEXT_PUBLIC_API_URL;
  private tokenKey = 'auth_token';

  private async request(endpoint: string, options?: RequestInit) {
    const token = localStorage.getItem(this.tokenKey);
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    };

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(this.tokenKey, data.token);
    return data;
  }

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ token: string; user: User }> {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    localStorage.setItem(this.tokenKey, data.token);
    return data;
  }

  async logout(): Promise<void> {
    localStorage.removeItem(this.tokenKey);
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.request('/auth/me');
    } catch {
      return null;
    }
  }
}
