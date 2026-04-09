import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import * as React from 'react';
import {
  Text,
  View,
} from 'react-native';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(!state.isConnected);
    });
    return unsubscribe;
  }, []);

  if (!isOffline)
    return null;

  return (
    <View className="flex-row items-center justify-center gap-2 bg-amber-500 px-4 py-2">
      <Ionicons name="wifi-outline" size={14} color="#fff" />
      <Text className="text-xs font-semibold text-white">
        You're offline — showing cached content
      </Text>
    </View>
  );
}
