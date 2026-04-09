import * as Notifications from 'expo-notifications';

export async function scheduleReminderNotification() {
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: '👋 We miss you!',
      body: 'Come back and continue your learning journey 🚀',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 24,
    },
  });
}
