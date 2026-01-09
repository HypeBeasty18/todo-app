import { AUTH_API } from '@/api/auth';
import { BASE_API_URL } from '@/api/config';
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const axiosWithoutAuth = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  withCredentials: true,
});

// Состояние refresh процесса
let isRefreshing = false;

// Очередь запросов, ожидающих refresh
type QueueItem = {
  resolve: (config: InternalAxiosRequestConfig) => void;
  reject: (error: Error) => void;
};
let failedQueue: QueueItem[] = [];

/**
 * Обрабатывает очередь после завершения refresh
 */
const processQueue = (error: Error | null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      // Повторяем запрос (config уже будет с новыми cookies)
      item.resolve({} as InternalAxiosRequestConfig);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const { status } = error.response;

    // Если 401 и это не повторный запрос
    if (status === 401 && !originalRequest._retry) {
      // Если уже идёт refresh — добавляем запрос в очередь
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => {
              resolve(axiosInstance.request(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axiosWithoutAuth.post(AUTH_API.REFRESH);

        if (refreshResponse.status === 200 && refreshResponse.data.success) {
          // Refresh успешен — обрабатываем очередь
          processQueue(null);

          // Повторяем оригинальный запрос
          return axiosInstance.request(originalRequest);
        }
      } catch (refreshError) {
        // Refresh не удался — отклоняем все запросы в очереди
        processQueue(refreshError as Error);

        // Редирект на логин
        window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
