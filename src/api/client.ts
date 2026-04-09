import axios from 'axios';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { getToken } from '@/lib/auth/utils';

export const api = axios.create({
  baseURL: 'https://api.freeapi.app/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();

  if (token?.access) {
    config.headers.Authorization = `Bearer ${token.access}`;
  }

  return config;
});
api.interceptors.response.use(
  res => res,
  async (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().signOut();
    }
    return Promise.reject(error);
  },
);
