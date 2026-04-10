import { useForm } from '@tanstack/react-form';

import { Stack } from 'expo-router';
import * as React from 'react';
import * as z from 'zod';

import {
  Button,
  Input,
  View,
} from '@/components/ui';
import { getFieldError } from '@/components/ui/form-utils';

const schema = z.object({
  title: z.string().min(10),
  body: z.string().min(120),
});

export function AddPostScreen() {
  const form = useForm({
    defaultValues: {
      title: '',
      body: '',
    },

    validators: {
      onChange: schema as any,
    },
    onSubmit: ({ value }) => {
      console.log(value);
    },
  });

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Add Post',
          headerBackTitle: 'Feed',
        }}
      />
      <View className="flex-1 p-4">
        <form.Field
          name="title"
          children={field => (
            <Input
              label="Title"
              testID="title"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />
        <form.Field
          name="body"
          children={field => (
            <Input
              label="Content"
              multiline
              testID="body-input"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChangeText={field.handleChange}
              error={getFieldError(field)}
            />
          )}
        />
        <form.Subscribe
          selector={state => [state.isSubmitting]}
          children={([isSubmitting]) => (
            <Button
              label="Add Post"
              loading={isSubmitting}
              onPress={form.handleSubmit}
              testID="add-post-button"
            />
          )}
        />
      </View>
    </>
  );
}
