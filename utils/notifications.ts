import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

const DEFAULT_CHANNEL_ID = 'mizan-default'

export const hasGrantedNotificationPermission = (settings: Notifications.NotificationPermissionsStatus): boolean =>
  settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL

export const getNotificationPermission = async (): Promise<Notifications.NotificationPermissionsStatus> =>
  Notifications.getPermissionsAsync()

export const ensureNotificationPermissions = async (requestIfNeeded = true): Promise<boolean> => {
  let settings = await getNotificationPermission()
  if (!hasGrantedNotificationPermission(settings) && requestIfNeeded) {
    settings = await Notifications.requestPermissionsAsync()
  }
  return hasGrantedNotificationPermission(settings)
}

export const configureNotifications = async (requestIfNeeded = true): Promise<boolean> => {
  const granted = await ensureNotificationPermissions(requestIfNeeded)
  if (!granted) return false

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(DEFAULT_CHANNEL_ID, {
      name: 'Mizan Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#38BDF8',
    })
  }

  return true
}

export const scheduleLocalNotification = async (
  title: string,
  body: string,
  trigger: Notifications.NotificationTriggerInput,
): Promise<string> => Notifications.scheduleNotificationAsync({
  content: {
    title,
    body,
    ...(Platform.OS === 'ios' ? { sound: true } : {}),
    ...(Platform.OS === 'android' ? { channelId: DEFAULT_CHANNEL_ID } : {}),
  },
  trigger,
})

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

export const scheduleHabitReminders = async (
  habitId: string,
  name: string,
  times: string[],
): Promise<string[]> => {
  const ids: string[] = []

  for (const time of times) {
    const [hour, minute] = time.split(':').map((value) => Number(value))
    if (Number.isNaN(hour) || Number.isNaN(minute)) continue
    const id = await scheduleHabitReminder(habitId, name, hour, minute)
    ids.push(id)
  }

  return ids
}
