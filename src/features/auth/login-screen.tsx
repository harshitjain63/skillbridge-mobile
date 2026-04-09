import type { LoginFormProps } from './components/login-form';
import axios from 'axios';

import { useRouter } from 'expo-router';
import * as React from 'react';
import { StatusBar } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { loginApi } from '@/api/auth';
import { FocusAwareStatusBar } from '@/components/ui';
import { useProfileStore } from '../profile/use-profile-store';
import { LoginForm } from './components/login-form';
import { useAuthStore } from './use-auth-store';

export function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore.use.signIn();
  const [loading, setLoading] = React.useState(false);

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    try {
      setLoading(true);
      const res = await loginApi({
        email: data.email,
        password: data.password,
      });

      const token = {
        access: res.data?.accessToken || res.accessToken,
        refresh: res.data?.refreshToken || res.refreshToken,
      };

      signIn(token);
      const setUser = useProfileStore.getState().setUser;

      setUser({
        id: res.data.user._id,
        username: res.data.user.username,
        email: res.data.user.email,
        avatar: res.data.user.avatar?.url,
        role: res.data.user.role,
      });
      router.replace('/');
    }
    catch (error) {
      if (error instanceof axios.AxiosError) {
        showMessage({
          message: 'Login Failed',
          description: error.response?.data?.message || 'An error occurred during login.',
          type: 'danger',
          statusBarHeight: StatusBar.currentHeight,
          icon: 'danger',
        });
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FocusAwareStatusBar />
      <LoginForm onSubmit={onSubmit} loading={loading} />
    </>
  );
}
