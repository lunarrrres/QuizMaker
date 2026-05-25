import { apiClient } from './client';
import type { Quiz } from '../types/quiz.types';

export const quizApi = {
  getAll: async (): Promise<Quiz[]> => {
    const { data } = await apiClient.get<Quiz[]>('/quizzes');
    return data;
  },
  getById: async (id: string): Promise<Quiz> => {
    const { data } = await apiClient.get<Quiz>(`/quizzes/${id}`);
    return data;
  },
  create: async (quiz: Omit<Quiz, '_id' | 'owner' | 'createdAt' | 'updatedAt'>): Promise<Quiz> => {
    const { data } = await apiClient.post<Quiz>('/quizzes', quiz);
    return data;
  },
  update: async (id: string, quiz: Partial<Quiz>): Promise<Quiz> => {
    const { data } = await apiClient.patch<Quiz>(`/quizzes/${id}`, quiz);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/quizzes/${id}`);
  },
};
