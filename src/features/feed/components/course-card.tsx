/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Notifications from 'expo-notifications';
import { Link } from 'expo-router';
import * as React from 'react';
import { Pressable, Text, useColorScheme, View } from 'react-native';
import { useCourseStore } from '../use-course-store';

type Props = {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  instructor: string;
  price: number;
  rating: number;
  category: string;
  brand: string;
};

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
          size={12}
          color={i < filled ? '#F59E0B' : colorScheme === 'dark' ? '#4B5563' : '#D1D5DB'}
        />
      ))}
      <Text className="ml-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
        {rating.toFixed(1)}
      </Text>
    </View>
  );
}

function InstructorAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(n => n[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const bg = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <View
      className="size-6 items-center justify-center rounded-full"
      style={{ backgroundColor: bg }}
    >
      <Text className="text-[9px] font-black text-white">{initials}</Text>
    </View>
  );
}

export function CourseCard({
  id,
  title,
  description,
  thumbnail,
  instructor,
  price,
  rating,
  category,
}: Props) {
  const colorScheme = useColorScheme();
  const { bookmarks, toggleBookmark }
    = useCourseStore();
  const [img, setImg] = React.useState(thumbnail);

  const isBookmarked = bookmarks.includes(Number(id));

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

  return (
    <Link href={`/feed/${id}`} asChild>
      <Pressable className="mx-4 my-2 overflow-hidden rounded-2xl bg-white shadow-sm active:scale-[0.985] active:opacity-90 dark:bg-neutral-900 dark:shadow-none">

        <View>
          <Image
            source={{ uri: img }}
            style={{ width: '100%', height: 180 }}
            contentFit="cover"
            cachePolicy="memory"
            onError={() => {
              setImg(`https://placehold.co/300x200?text=${title}&font=roboto`);
            }}
          />

          <View className="absolute bottom-2.5 left-2.5 rounded-full bg-indigo-500/90 px-3 py-1">
            <Text className="text-[10px] font-bold tracking-wide text-white uppercase">
              {category}
            </Text>
          </View>

          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              handleBookmark();
            }}
            className="absolute top-2.5 right-2.5 rounded-full bg-black/35 p-1.5"
            hitSlop={8}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isBookmarked ? '#818CF8' : '#fff'}
            />
          </Pressable>
        </View>

        <View className="p-3.5">
          <Text
            className="mb-1.5 text-base/snug font-bold text-gray-900 dark:text-white"
            numberOfLines={2}
          >
            {title}
          </Text>

          <View className="mb-1.5 flex-row items-center">
            <InstructorAvatar name={instructor} />
            <Text
              className="ml-2 flex-1 text-xs font-medium text-gray-500 dark:text-gray-400"
              numberOfLines={1}
            >
              {instructor}
            </Text>
          </View>

          <Text
            className="mb-2 text-xs/relaxed text-gray-400 dark:text-gray-500"
            numberOfLines={2}
          >
            {description}
          </Text>

          {/* Footer: stars + price */}
          <View className="flex-row items-center justify-between">
            <StarRating rating={rating} />
            <View className="flex-row items-center rounded-full bg-indigo-50 px-2.5 py-1 dark:bg-indigo-950">
              <Ionicons
                name="pricetag"
                size={11}
                color={colorScheme === 'dark' ? '#818CF8' : '#6366F1'}
              />
              <Text className="ml-1 text-xs font-black text-indigo-600 dark:text-indigo-400">
                $
                {price}
              </Text>
            </View>
          </View>
        </View>

      </Pressable>
    </Link>
  );
}
