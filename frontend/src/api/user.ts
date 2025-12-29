import { axiosInstance } from '@/api/axios';
import { BASE_API_URL } from '@/api/config';

export const USER_API = {
  GET_ALL: `${BASE_API_URL}/user`,
} as const;

export const userApi = {
  getAll: async () => {
    const response = await axiosInstance.get(USER_API.GET_ALL);
    return response;
  },
};
