/* eslint-disable max-lines-per-function */
import { useForm } from '@tanstack/react-form';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import * as z from 'zod';

import { Button, Input, Text, View } from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';

const schema = z.object({
  name: z.string().optional(),
  email: z
    .string({
      message: 'Email is required',
    })
    .min(1, 'Email is required')
    .email('Invalid email format'),
  password: z
    .string({
      message: 'Password is required',
    })
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type FormType = z.infer<typeof schema>;

export type LoginFormProps = {
  onSubmit?: (data: FormType) => void;
  loading?: boolean;
  type?: 'login' | 'register';
};

export function LoginForm({
  onSubmit = () => {},
  loading = false,
  type = 'login',
}: LoginFormProps) {
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
    validators: {
      onChange: schema as any,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior="padding"
      keyboardVerticalOffset={10}
    >
      <View className="flex-1 justify-center p-4">
        {/* Header */}
        <View className="items-center justify-center">
          <Text className="pb-6 text-center text-4xl font-bold">
            {type === 'login' ? 'Sign In' : 'Create Account'}
          </Text>

          <Text className="mb-6 max-w-xs text-center text-gray-500">
            {type === 'login'
              ? 'Sign in to access your courses and continue learning.'
              : 'Create an account to start your learning journey.'}
          </Text>
        </View>

        {/* Name (only for register) */}
        {type === 'register' && (
          <form.Field
            name="name"
            children={field => (
              <Input
                label="Name"
                editable={!loading}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChangeText={text => field.handleChange(text.toLowerCase())}
                error={getFieldError(field)}
              />
            )}
          />
        )}

        {/* Email */}
        <form.Field
          name="email"
          children={field => (
            <Input
              testID="email-input"
              label="Email"
              editable={!loading}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        {/* Password */}
        <form.Field
          name="password"
          children={field => (
            <Input
              testID="password-input"
              label="Password"
              placeholder="***"
              secureTextEntry
              editable={!loading}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />

        {/* Button */}
        <form.Subscribe
          selector={state => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button
              testID="login-button"
              label={type === 'login' ? 'Login' : 'Register'}
              onPress={form.handleSubmit}
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
            />
          )}
        />

        {/* Navigation */}
        <View className="mt-4 flex-row justify-center">
          {type === 'login'
            ? (
                <>
                  <Text className="text-gray-500">
                    Don't have an account?
                    {' '}
                  </Text>
                  <Pressable onPress={() => router.push('/register')}>
                    <Text className="font-semibold text-blue-500">
                      Sign up
                    </Text>
                  </Pressable>
                </>
              )
            : (
                <>
                  <Text className="text-gray-500">
                    Already have an account?
                    {' '}
                  </Text>
                  <Pressable onPress={() => router.replace('/login')}>
                    <Text className="font-semibold text-blue-500">
                      Sign in
                    </Text>
                  </Pressable>
                </>
              )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
