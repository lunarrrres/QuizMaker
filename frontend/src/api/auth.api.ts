import { apiClient } from './client';
import type { AuthResponse, LoginDto, RegisterDto } from '@/types/auth.types';

export const authApi = {
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', dto);
    return response.data;
  },

  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', dto);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', {}, {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    });
    return response.data;
  }
};
