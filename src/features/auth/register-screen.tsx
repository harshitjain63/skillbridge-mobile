import type { LoginFormProps } from './components/login-form';
import axios from 'axios';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { StatusBar } from 'react-native';
import { showMessage } from 'react-native-flash-message';

import { registerApi } from '@/api/auth';
import { FocusAwareStatusBar } from '@/components/ui';
import { LoginForm } from './components/login-form';

export function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const onSubmit: LoginFormProps['onSubmit'] = async (data) => {
    try {
      setLoading(true);

      await registerApi({
        email: data.email,
        password: data.password,
        username: data.name,
      });

      showMessage({
        message: 'Success',
        description: 'Account created successfully. Please login.',
        type: 'success',
        statusBarHeight: StatusBar.currentHeight,
      });

      router.replace('/login');
    }
    catch (error) {
      if (error instanceof axios.AxiosError) {
        showMessage({
          message: 'Registration Failed',
          description:
           error.response?.data?.message || 'Something went wrong',
          type: 'danger',
          statusBarHeight: StatusBar.currentHeight,
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
      <LoginForm onSubmit={onSubmit} loading={loading} type="register" />
    </>
  );
}
