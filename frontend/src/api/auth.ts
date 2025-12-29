import { axiosWithoutAuth } from '@/api/axios';
import { BASE_API_URL } from '@/api/config';

export const AUTH_API = {
  SIGNUP: `${BASE_API_URL}/auth/signup`,
  SIGNIN: `${BASE_API_URL}/auth/signin`,
  REFRESH: `${BASE_API_URL}/auth/refresh`,
} as const;

export const authApi = {
  signup: async (email: string, password: string) => {
    const response = await axiosWithoutAuth.post(AUTH_API.SIGNUP, {
      email,
      password,
    });
    return response;
  },
  signin: async (email: string, password: string) => {
    const response = await axiosWithoutAuth.post(AUTH_API.SIGNIN, {
      email,
      password,
    });
    return response;
  },
};
