import { useRouter } from 'expo-router';
import * as React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';
import { Cover } from './components/cover';

export function OnboardingScreen() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  return (
    <View className="flex h-full items-center justify-center">
      <FocusAwareStatusBar />
      <View className="w-full flex-1">
        <Cover />
      </View>
      <View className="justify-end px-4">
        <Text className="my-3 text-center text-4xl font-bold">
          Learn Anytime, Anywhere
        </Text>

        <Text className="mb-4 text-center text-base text-gray-600">
          Discover courses, upgrade your skills, and stay consistent.
        </Text>

        <Text className="my-1 pt-4 text-left text-base">
          📚 Explore a variety of courses
        </Text>

        <Text className="my-1 text-left text-base">
          🔍 Search by topic, instructor, or category
        </Text>

        <Text className="my-1 text-left text-base">
          📶 Access courses even when offline
        </Text>

        <Text className="my-1 text-left text-base">
          ⏰ Get reminders to keep learning daily
        </Text>
      </View>
      <SafeAreaView className="mt-6">
        <Button
          label="Let's Get Started "
          onPress={() => {
            setIsFirstTime(false);
            router.replace('/login');
          }}
        />
      </SafeAreaView>
    </View>
  );
}
