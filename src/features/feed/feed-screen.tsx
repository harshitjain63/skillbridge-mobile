/* eslint-disable max-lines-per-function */
import type { Course } from './api';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useFocusEffect } from 'expo-router';

import * as React from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Pressable,
  StatusBar,
  Text,
  TextInput,

  useColorScheme,
  View,
} from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { scheduleReminderNotification } from '@/lib/notifications';
import { OfflineBanner } from '../auth/components/offline-banner';
import { useCourses } from './api';
import { CourseCard } from './components/course-card';
import { useCourseCacheStore } from './use-course-data';
import { useCourseStore } from './use-course-store';

function SkeletonCard() {
  return (
    <View className="mx-4 my-2 overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-neutral-900 dark:shadow-none">
      <View className="h-44 w-full bg-gray-200 dark:bg-neutral-800" />
      <View className="p-3.5">
        <View className="mb-2 h-4 w-3/4 rounded-lg bg-gray-200 dark:bg-neutral-700" />
        <View className="mb-1.5 h-3 w-2/5 rounded-lg bg-gray-100 dark:bg-neutral-800" />
        <View className="mb-1.5 h-3 w-full rounded-lg bg-gray-100 dark:bg-neutral-800" />
        <View className="h-3 w-3/5 rounded-lg bg-gray-100 dark:bg-neutral-800" />
      </View>
    </View>
  );
}

function LoadingState() {
  return (
    <View className="pt-2">
      {Array.from({ length: 4 }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <SkeletonCard key={i} />
      ))}
    </View>
  );
}

function EmptyState({ search }: { search: string }) {
  const colorScheme = useColorScheme();
  return (
    <View className="flex-1 items-center justify-center px-8 pt-20">
      <Ionicons
        name="search-outline"
        size={56}
        color={colorScheme === 'dark' ? '#374151' : '#D1D5DB'}
      />
      <Text className="mt-3 text-lg font-bold text-gray-700 dark:text-gray-300">
        {search ? 'No courses found' : 'No courses yet'}
      </Text>
      <Text className="mt-1 text-center text-sm/5 text-gray-400 dark:text-gray-500">
        {search
          ? `Nothing matched "${search}". Try a different keyword.`
          : 'Check back later for new courses.'}
      </Text>
    </View>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  const colorScheme = useColorScheme();
  return (
    <View className="flex-1 items-center justify-center px-8 pt-20">
      <Ionicons
        name="cloud-offline-outline"
        size={56}
        color={colorScheme === 'dark' ? '#7F1D1D' : '#F87171'}
      />
      <Text className="mt-3 text-lg font-bold text-gray-700 dark:text-gray-300">
        Failed to load
      </Text>
      <Text className="mt-1 text-center text-sm/5 text-gray-400 dark:text-gray-500">
        Check your connection and try again.
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-5 flex-row items-center rounded-xl bg-indigo-500 px-6 py-3 active:opacity-80 dark:bg-indigo-600"
      >
        <Ionicons name="refresh" size={16} color="#fff" />
        <Text className="ml-2 font-bold text-white">Retry</Text>
      </Pressable>
    </View>
  );
}

function ListHeader({
  search,
  setSearch,
  count,
}: {
  search: string;
  setSearch: (s: string) => void;
  count: number;
}) {
  const colorScheme = useColorScheme();
  return (
    <View className="px-4 pt-5 pb-3">
      <Text className="text-2xl font-black tracking-tight text-gray-900 dark:text-white">
        Explore Courses
      </Text>
      <Text className="mt-0.5 mb-4 text-sm text-gray-400 dark:text-gray-500">
        {count}
        {' '}
        courses available
      </Text>

      <View className="flex-row items-center rounded-2xl bg-white px-3 py-2.5 shadow-sm dark:bg-neutral-800 dark:shadow-none">
        <Ionicons
          name="search"
          size={18}
          color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
        />
        <TextInput
          placeholder="Search courses, topics, instructors…"
          placeholderTextColor={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          className="ml-2 flex-1 text-sm text-gray-900 dark:text-white"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

export function FeedScreen() {
  const colorScheme = useColorScheme();
  const { data, isError, isLoading, refetch, isRefetching } = useCourses();
  const [search, setSearch] = React.useState('');
  const cachedCourses = useCourseCacheStore(s => s.courses);
  const hydrate = useCourseStore(s => s.hydrate);
  const hydrateCache = useCourseCacheStore(s => s.hydrate);
  const backPressCount = React.useRef(0);

  React.useEffect(() => {
    hydrate();
    hydrateCache();
  }, [hydrate, hydrateCache]);

  React.useEffect(() => {
    scheduleReminderNotification();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (backPressCount.current === 0) {
          backPressCount.current += 1;

          showMessage({
            message: 'Press back again to exit',
            type: 'info',
            position: 'top',
            statusBarHeight: StatusBar.currentHeight,
            icon: 'info',

          });

          setTimeout(() => {
            backPressCount.current = 0;
          }, 2000);

          return true;
        }

        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove(); // 🔥 cleanup on blur
    }, []),
  );

  const finalData = data?.length ? data : cachedCourses;

  const filteredData = React.useMemo(() => {
    if (!finalData)
      return [];

    const q = search.toLowerCase();

    return finalData.filter(
      item =>
        item.title.toLowerCase().includes(q)
        || item.instructor.toLowerCase().includes(q)
        || item.category.toLowerCase().includes(q),
    );
  }, [finalData, search]);

  const renderItem = React.useCallback(
    ({ item }: { item: Course }) => <CourseCard {...item} />,
    [],
  );

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-neutral-950">
        <OfflineBanner />
        <ListHeader search={search} setSearch={setSearch} count={0} />
        <LoadingState />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-neutral-950">
        <ErrorState onRetry={refetch} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-neutral-950">
      <OfflineBanner />

      <FlashList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListHeaderComponent={(
          <ListHeader
            search={search}
            setSearch={setSearch}
            count={data?.length ?? 0}
          />
        )}
        ListEmptyComponent={<EmptyState search={search} />}
        ListFooterComponent={
          isRefetching
            ? (
                <ActivityIndicator
                  size="small"
                  color={colorScheme === 'dark' ? '#818CF8' : '#6366F1'}
                  style={{ marginVertical: 16 }}
                />
              )
            : null
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}
