import * as Notifications from "expo-notifications";
import { useAppStore } from "@/stores/useAppStore";
import { useTaskStore } from "@/stores/useTaskStore";
import { useMoodStore } from "@/stores/useMoodStore";
import { getTodayString, toLocalDateString } from "@/utils/dateHelpers";
import { storage } from "@/utils/storage";

const KEY = "smart-notification-ids";

const getCachedIds = (): string[] => {
  try {
    const raw = storage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
};

const saveIds = (ids: string[]) => {
  storage.setItem(KEY, JSON.stringify(ids));
};

const scheduleAt = async (title: string, body: string, date: Date): Promise<string> =>
  Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
    } as Notifications.DateTriggerInput,
  });

const setTime = (base: Date, hour: number, minute: number): Date => {
  const next = new Date(base);
  next.setHours(hour, minute, 0, 0);
  return next;
};

export const refreshSmartNotifications = async () => {
  const settings = useAppStore.getState().settings;
  if (!settings.notificationsEnabled) return;

  const previous = getCachedIds();
  await Promise.all(previous.map((id) => Notifications.cancelScheduledNotificationAsync(id)));

  const ids: string[] = [];
  const now = new Date();
  const today = getTodayString();
  const tomorrow = toLocalDateString(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const todayTasks = useTaskStore.getState().getTodayTasks();
  const todayMood = useMoodStore.getState().getTodayMood();
  const yesterdayMood = useMoodStore
    .getState()
    .entries.find((entry) => entry.date === toLocalDateString(new Date(now.getTime() - 24 * 60 * 60 * 1000)));

  // Rule 1: Mid-day nudge if no progress on today tasks.
  const hasUnfinished = todayTasks.some((task) => !task.completed && task.dueDate.startsWith(today));
  if (hasUnfinished) {
    const midDay = setTime(now, 14, 0);
    if (midDay.getTime() > now.getTime()) {
      ids.push(
        await scheduleAt("متابعة مهامك", "ابدأ بخطوة صغيرة دلوقتي وكمّل يومك براحة.", midDay),
      );
    }
  }

  // Rule 2: Evening reminder if mood is not logged.
  if (!todayMood) {
    const evening = setTime(now, 21, 0);
    if (evening.getTime() > now.getTime()) {
      ids.push(await scheduleAt("سجل مزاجك", "سجل مزاجك لليوم في أقل من دقيقة.", evening));
    }
  }

  // Rule 3: Next morning encouragement after low mood yesterday.
  if (yesterdayMood && yesterdayMood.mood <= 2) {
    const nextMorningBase = new Date(`${tomorrow}T00:00:00`);
    const nextMorning = setTime(nextMorningBase, 8, 30);
    ids.push(
      await scheduleAt("صباح جديد", "أنت أقوى مما تتخيل. ابدأ يومك بحاجة صغيرة جميلة.", nextMorning),
    );
  }

  saveIds(ids.slice(0, 3));
};

