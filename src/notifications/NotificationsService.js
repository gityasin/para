import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function scheduleDailyReminder() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    alert('Notification permissions not granted!');
    return;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('daily-reminders', {
      name: 'Daily Reminders',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Budget Reminder',
      body: 'Don’t forget to log your expenses today!',
      sound: true,
    },
    trigger: {
      hour: 9,
      minute: 0,
      repeats: true,
      channelId: 'daily-reminders', 
    },
  });

  alert('Daily reminder scheduled for 9 AM.');
}

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
