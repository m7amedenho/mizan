import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const DEFAULT_CHANNEL_ID = 'mizan-default'

export const ensureNotificationPermissions = async (): Promise<boolean> => {
  const current = await Notifications.getPermissionsAsync()
  if (current.granted || current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true
  }
  const requested = await Notifications.requestPermissionsAsync()
  return requested.granted || requested.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
}

export const configureNotifications = async (): Promise<boolean> => {
  const granted = await ensureNotificationPermissions()
  if (!granted) return false

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: 'Mizan Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#38BDF8',
      sound: 'default',
    })
  }

  return true
}

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput,
): Promise<string> => {
  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      ...(Platform.OS === 'android' ? { channelId: DEFAULT_CHANNEL_ID } : {}),
    },
    trigger,
  })
  return id
}

export const cancelNotification = async (id: string) => {
  await Notifications.cancelScheduledNotificationAsync(id)
}

export const scheduleTaskReminder = async (
  taskId: string,
  title: string,
  dateTime: Date,
): Promise<string> => {
  void taskId
  return scheduleLocalNotification(
    '⏰ حان وقت مهمتك!',
    title,
    {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: dateTime,
    } as Notifications.DateTriggerInput,
  )
}

export const scheduleHabitReminder = async (
  habitId: string,
  name: string,
  hour: number,
  minute: number,
): Promise<string> => {
  void habitId
  return scheduleLocalNotification(
    '🌟 وقت عادتك!',
    `لا تنسى: ${name}`,
    {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    } as Notifications.DailyTriggerInput,
  )
}
