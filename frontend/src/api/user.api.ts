import { apiClient } from './client';

export const userApi = {
  updateProfile: (data: { name?: string; avatarUrl?: string }) => 
    apiClient.patch('/users/profile', data).then(r => r.data),
};
