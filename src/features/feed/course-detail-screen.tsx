/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCourses } from './api';
import { useCourseStore } from './use-course-store';

const AVATAR_COLORS = ['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#3B82F6'];

function StarRating({ rating }: { rating: number }) {
  const colorScheme = useColorScheme();
  const filled = Math.round(rating);
  return (
    <View className="flex-row items-center">
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          name={i < filled ? 'star' : 'star-outline'}
          size={15}
          color={i < filled ? '#F59E0B' : colorScheme === 'dark' ? '#4B5563' : '#D1D5DB'}
        />
      ))}
      <Text className="ml-1.5 text-sm font-bold text-gray-600 dark:text-gray-400">
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

type ChipVariant = 'indigo' | 'emerald';

function Chip({ icon, label, variant = 'indigo' }: { icon: string; label: string; variant?: ChipVariant }) {
  const colorScheme = useColorScheme();
  const isIndigo = variant === 'indigo';

  const iconColor = colorScheme === 'dark'
    ? isIndigo ? '#818CF8' : '#34D399'
    : isIndigo ? '#6366F1' : '#059669';

  return (
    <View
      className={`flex-row items-center rounded-full px-3 py-1.5 ${
        isIndigo
          ? 'bg-indigo-50 dark:bg-indigo-950'
          : 'bg-emerald-50 dark:bg-emerald-950'
      }`}
    >
      <Ionicons name={icon as any} size={13} color={iconColor} />
      <Text
        className={`ml-1 text-xs font-bold ${
          isIndigo
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-emerald-700 dark:text-emerald-400'
        }`}
      >
        {label}
      </Text>
    </View>
  );
}

function ImageGallery({ images }: { images: string[] }) {
  const [selected, setSelected] = React.useState(0);
  if (!images?.length)
    return null;
  return (
    <View className="mt-1">
      <Text className="mb-2 text-xs font-black tracking-widest text-gray-500 uppercase dark:text-gray-400">
        Gallery
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      >
        {images.map((uri, i) => (
          <Pressable
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            onPress={() => setSelected(i)}
            className={`overflow-hidden rounded-xl border-2 ${
              selected === i
                ? 'border-indigo-500 dark:border-indigo-400'
                : 'border-transparent'
            }`}
            style={{ width: 90, height: 68 }}
          >
            <Image
              source={{ uri }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

function InstructorCard({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const bg = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <View className="flex-row items-center rounded-2xl bg-white p-3 shadow-sm dark:bg-neutral-800 dark:shadow-none">
      <View
        className="size-10 items-center justify-center rounded-full"
        style={{ backgroundColor: bg }}
      >
        <Text className="text-sm font-black text-white">{initials}</Text>
      </View>
      <View className="ml-3">
        <Text className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
          Instructor
        </Text>
        <Text className="text-sm font-bold text-gray-900 dark:text-white">
          {name}
        </Text>
      </View>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-xs font-black tracking-widest text-gray-500 uppercase dark:text-gray-400">
      {children}
    </Text>
  );
}

function Divider() {
  return <View className="h-px bg-gray-100 dark:bg-neutral-800" />;
}

export function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { data } = useCourses();
  const { bookmarks, toggleBookmark, enrolledCourses, toggleEnroll }
    = useCourseStore();

  const course = data?.find(c => c.id === Number(id));
  const isBookmarked = bookmarks.includes(Number(id));
  const isEnrolled = enrolledCourses.includes(Number(id));

  const handleBookmark = React.useCallback(async () => {
    toggleBookmark(Number(id));
    const willBookmark = !isBookmarked;
    const newCount = willBookmark ? bookmarks.length + 1 : bookmarks.length - 1;

    if (willBookmark && newCount >= 5) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: '🎯 5 courses bookmarked!',
            body: 'You\'re building a great collection. Ready to start learning?',
          },
          trigger: null,
        });
      }
    }
  }, [id, isBookmarked, bookmarks.length, toggleBookmark]);
  const handleEnroll = React.useCallback(() => {
    if (isEnrolled) {
      Alert.alert('Already Enrolled', 'You are enrolled in this course.');
      return;
    }
    toggleEnroll(Number(id));
    Alert.alert('🚀 Enrolled!', `You're now enrolled in "${course?.title}".`);
  }, [isEnrolled, id, toggleEnroll, course]);

  if (!course) {
    return (
      <View className="flex-1 items-center justify-center gap-y-3 bg-gray-50 p-8 dark:bg-neutral-950">
        <Stack.Screen options={{ title: 'Course' }} />
        <Ionicons
          name="alert-circle-outline"
          size={56}
          color={colorScheme === 'dark' ? '#7F1D1D' : '#F87171'}
        />
        <Text className="text-lg font-bold text-gray-700 dark:text-gray-300">
          Course not found
        </Text>
        <Pressable
          className="mt-2 rounded-xl bg-indigo-500 px-6 py-3 dark:bg-indigo-600"
          onPress={() => router.back()}
        >
          <Text className="font-bold text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-neutral-950">
      <Stack.Screen
        options={{
          title: 'Course Detail',
          headerTransparent: false,
          headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}
      >
        <View className="relative w-full" style={{ height: 300 }}>
          <Image
            source={{ uri: course.thumbnail }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-black/25" />
          <Pressable
            onPress={handleBookmark}
            className="absolute right-4 rounded-full bg-black/40 p-2"
            style={{ top: 52 }}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={isBookmarked ? '#818CF8' : '#fff'}
            />
          </Pressable>
        </View>

        <View className="gap-y-3 p-5">

          <View className="flex-row flex-wrap gap-2">
            <Chip icon="layers-outline" label={course.category} variant="indigo" />
            <Chip icon="business-outline" label={course.brand} variant="emerald" />
          </View>

          <Text className="text-2xl/tight font-black tracking-tight text-gray-900 dark:text-white">
            {course.title}
          </Text>

          <InstructorCard name={course.instructor} />

          <StarRating rating={course.rating} />

          <View className="flex-row items-center rounded-2xl bg-indigo-50 p-3 dark:bg-indigo-950">
            <Ionicons
              name="pricetag"
              size={18}
              color={colorScheme === 'dark' ? '#818CF8' : '#6366F1'}
            />
            <Text className="ml-2 text-2xl font-black text-indigo-600 dark:text-indigo-400">
              $
              {course.price}
            </Text>
            <Text className="mt-1 ml-2 text-xs text-indigo-400 dark:text-indigo-500">
              one-time payment
            </Text>
          </View>

          <Divider />

          <SectionLabel>About this course</SectionLabel>
          <Text className="text-sm/6 text-gray-500 dark:text-gray-400">
            {course.description}
          </Text>

          <ImageGallery images={course.images} />

          <Divider />

          <Pressable
            onPress={() => router.push(`/feed/${id}/content`)}
            className="flex-row items-center rounded-2xl bg-indigo-50 p-4 active:opacity-75 dark:bg-indigo-950"
          >
            <Ionicons
              name="play-circle-outline"
              size={22}
              color={colorScheme === 'dark' ? '#818CF8' : '#6366F1'}
            />
            <Text className="ml-3 flex-1 font-bold text-indigo-600 dark:text-indigo-400">
              Preview Course Content
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={colorScheme === 'dark' ? '#818CF8' : '#6366F1'}
            />
          </Pressable>

        </View>
      </ScrollView>

      <View
        className="absolute inset-x-0 bottom-0 flex-row gap-x-3 border-t border-gray-100 bg-white px-4 pt-3 dark:border-neutral-800 dark:bg-neutral-900"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          onPress={handleBookmark}
          className={`size-12 items-center justify-center rounded-xl border ${
            isBookmarked
              ? 'border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950'
              : 'border-gray-200 bg-white dark:border-neutral-700 dark:bg-neutral-800'
          }`}
        >
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={
              isBookmarked
                ? colorScheme === 'dark' ? '#818CF8' : '#6366F1'
                : colorScheme === 'dark' ? '#6B7280' : '#9CA3AF'
            }
          />
        </Pressable>

        <Pressable
          onPress={handleEnroll}
          className={`h-12 flex-1 flex-row items-center justify-center rounded-xl active:opacity-80 ${
            isEnrolled
              ? 'bg-emerald-500 dark:bg-emerald-600'
              : 'bg-indigo-500 dark:bg-indigo-600'
          }`}
        >
          <Ionicons
            name={isEnrolled ? 'checkmark-circle' : 'school-outline'}
            size={20}
            color="#fff"
          />
          <Text className="ml-2 text-base font-black text-white">
            {isEnrolled ? 'Enrolled ✓' : 'Enroll Now'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
