import { AUTH_API } from '@/api/auth';
import { BASE_API_URL } from '@/api/config';
import axios from 'axios';

export const axiosWithoutAuth = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

// Список URL которые не должны триггерить refresh

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config: originalRequest } = error;

    if (!response) {
      return Promise.reject(error);
    }

    const { status } = response;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshResponse = await axiosWithoutAuth.post(AUTH_API.REFRESH);

        if (refreshResponse.status === 200 && refreshResponse.data.user) {
          return axiosInstance.request(originalRequest);
        }
      } catch {
        // Refresh не удался — редирект на логин
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    // Если 401 на auth запросе — просто возвращаем ошибку
    return Promise.reject(error);
  },
);
