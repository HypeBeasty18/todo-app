import { axiosInstance } from '@/api/axios';
import { BASE_API_URL } from '@/api/config';
import type { Todo } from '@/types';

export const TODO_API = {
  GET_ALL: `${BASE_API_URL}/todo/list`,
  GET_ONE: `${BASE_API_URL}/todo/:id`,
  CREATE: `${BASE_API_URL}/todo`,
  UPDATE: `${BASE_API_URL}/todo/:id`,
  DELETE: `${BASE_API_URL}/todo/:id`,
} as const;

export const todoApi = {
  getAll: async ({
    search,
    priority,
    completed,
  }: {
    search?: string;
    priority?: string;
    completed?: boolean;
  }) => {
    const response = await axiosInstance.post(TODO_API.GET_ALL, {
      filters: { search, priority, completed },
    });
    return response;
  },
  getOne: async (id: string) => {
    const response = await axiosInstance.get(
      TODO_API.GET_ONE.replace(':id', id),
    );
    return response;
  },
  create: async (todo: Pick<Todo, 'title' | 'description' | 'priority'>) => {
    const response = await axiosInstance.post(TODO_API.CREATE, todo);
    return response;
  },
};
