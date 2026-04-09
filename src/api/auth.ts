import { api } from './client';

export async function loginApi(data: {
  email: string;
  password: string;
}) {
  const res = await api.post('/users/login', data);
  return res.data;
}

export async function registerApi(data: {
  email: string;
  password: string;
  username?: string;
}) {
  const res = await api.post('/users/register', {
    ...data,
    role: 'USER',
  });

  return res.data;
}
