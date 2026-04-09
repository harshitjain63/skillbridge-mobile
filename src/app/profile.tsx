/* eslint-disable max-lines-per-function */
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { showMessage } from 'react-native-flash-message';
import { api } from '@/api/client';
import { useAuthStore } from '@/features/auth/use-auth-store';
import { useCourseStore } from '@/features/feed/use-course-store';
import { useProfileStore } from '@/features/profile/use-profile-store';
import { getToken } from '@/lib/auth/utils';

function getAvatarUri(avatar: string | undefined | null, username: string): string {
  if (avatar && avatar.startsWith('http'))
    return avatar;
  return `https://ui-avatars.com/api/?background=4f46e5&color=fff&size=200&name=${encodeURIComponent(username ?? 'U')}`;
}

function StatCard({
  value,
  label,
  valueColor = '#818cf8',
}: {
  value: string | number;
  label: string;
  valueColor?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: 12,
        backgroundColor: '#1a1826',
        borderWidth: 0.5,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: '700', color: valueColor }}>
        {value}
      </Text>
      <Text style={{ marginTop: 2, fontSize: 11, color: '#6b7280' }}>
        {label}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const token = getToken();
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  const { user, updateAvatar, hydrate, clearProfile } = useProfileStore();
  const { bookmarks, enrolledCourses } = useCourseStore();
  const signOut = useAuthStore.use.signOut();

  const [avatarLoading, setAvatarLoading] = React.useState(false);

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  const progress = enrolledCourses.length > 0
    ? Math.min(100, Math.round((enrolledCourses.length / 10) * 100))
    : 0;

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          clearProfile();
          signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled)
      return;

    const uri = result.assets[0].uri;

    try {
      setAvatarLoading(true);

      const formData = new FormData();
      formData.append('avatar', {
        uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);

      const res = await api.patch('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token?.access}` },

      });

      const newAvatar: string | undefined = res.data?.data?.avatar?.url;

      if (newAvatar) {
        updateAvatar(newAvatar);
        showMessage({
          message: 'Avatar updated!',
          description: 'Your profile picture has been saved.',
          type: 'success',
          icon: 'success',
          statusBarHeight: StatusBar.currentHeight,
        });
      }
      else {
        showMessage({
          message: 'Upload issue',
          description: 'Upload succeeded but no image URL was returned.',
          type: 'warning',
          icon: 'warning',
          statusBarHeight: StatusBar.currentHeight,
        });
      }
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
      setAvatarLoading(false);
    }
  };

  if (!user) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: isDark ? '#030712' : '#f9fafb' }}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  const avatarUri = getAvatarUri(user.avatar, user.username);
  const bgColor = isDark ? '#030712' : '#f9fafb';
  const textPrimary = isDark ? '#f1f0ff' : '#111827';
  const textMuted = isDark ? '#9ca3af' : '#6b7280';
  const cardBg = isDark ? '#0f0f14' : '#ffffff';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bgColor }}
      contentContainerStyle={{ paddingBottom: 48 }}
      showsVerticalScrollIndicator={false}
    >

      <View style={{ height: 110, backgroundColor: '#4338ca' }} />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          marginTop: -44,
          marginBottom: 12,
        }}
      >
        <Pressable onPress={pickImage} disabled={avatarLoading}>
          <Image
            source={{ uri: avatarUri }}
            style={{
              width: 88,
              height: 88,
              borderRadius: 44,
              borderWidth: 3,
              borderColor: cardBg,
            }}
          />
          {/* Camera / spinner overlay */}
          <View
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              width: 24,
              height: 24,
              borderRadius: 12,
              backgroundColor: '#4f46e5',
              borderWidth: 2,
              borderColor: cardBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {avatarLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="camera" size={11} color="white" />}
          </View>
        </Pressable>

        <Pressable
          onPress={handleLogout}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            paddingHorizontal: 14,
            paddingVertical: 7,
            borderRadius: 20,
            borderWidth: 0.5,
            borderColor: 'rgba(239,68,68,0.35)',
            backgroundColor: 'rgba(239,68,68,0.10)',
            marginBottom: 4,
          }}
        >
          <Ionicons name="log-out-outline" size={14} color="#f87171" />
          <Text style={{ color: '#f87171', fontSize: 12, fontWeight: '500' }}>
            Logout
          </Text>
        </Pressable>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: textPrimary }}>
          {user.username}
        </Text>
        <Text style={{ marginTop: 3, fontSize: 14, color: textMuted }}>
          {user.email}
        </Text>
        {user.role
          ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderRadius: 20,
                  borderWidth: 0.5,
                  borderColor: 'rgba(99,102,241,0.4)',
                  backgroundColor: 'rgba(79,70,229,0.18)',
                }}
              >
                <Text style={{ color: '#a5b4fc', fontSize: 12, fontWeight: '500' }}>
                  {user.role}
                </Text>
              </View>
            )
          : null}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 20 }}>
        <StatCard value={enrolledCourses.length} label="Enrolled" />
        <StatCard value={bookmarks.length} label="Bookmarks" />
        <StatCard value={`${progress}%`} label="Progress" valueColor="#34d399" />
      </View>

      <View
        style={{
          marginHorizontal: 20,
          marginTop: 10,
          borderRadius: 14,
          backgroundColor: '#1a1826',
          padding: 16,
          borderWidth: 0.5,
          borderColor: 'rgba(255,255,255,0.05)',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ fontSize: 13, color: '#d1d5db' }}>Overall Progress</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#818cf8' }}>
            {progress}
            %
          </Text>
        </View>

        <View style={{ height: 6, borderRadius: 99, backgroundColor: '#2d2b3d', flexDirection: 'row', overflow: 'hidden' }}>
          {/* Filled portion */}
          <View style={{ flex: progress, backgroundColor: '#4f46e5' }} />
          {/* Empty portion */}
          <View style={{ flex: 100 - progress }} />
        </View>
      </View>
    </ScrollView>
  );
}
