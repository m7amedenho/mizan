import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '@/utils/storage'
import { Habit } from '@/types'
import { generateId, getTodayString, toLocalDateString } from '@/utils/dateHelpers'
import { cancelNotification } from '@/utils/notifications'

const getTargetPerDay = (habit: Habit): number => Math.max(1, habit.targetPerDay ?? 1)

const getCompletionCountForDate = (habit: Habit, dateKey: string): number =>
  habit.completions.filter((completion) => completion === dateKey).length

interface HabitState {
  habits: Habit[]
  addHabit: (h: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => string
  updateHabit: (id: string, partial: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  checkInHabit: (id: string) => void
  isCompletedToday: (id: string) => boolean
  getCompletedCountToday: (id: string) => number
  getStreak: (id: string) => number
  getWeekGrid: (id: string) => boolean[]
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      addHabit: (h) => {
        const id = generateId()
        const reminderTimes = (h.reminderTimes?.length ? h.reminderTimes : h.reminderTime ? [h.reminderTime] : [])
          .filter(Boolean)
        const notificationIds = (h.notificationIds?.length ? h.notificationIds : h.notificationId ? [h.notificationId] : [])
          .filter(Boolean) as string[]

        set((s) => ({
          habits: [
            ...s.habits,
            {
              ...h,
              id,
              targetPerDay: Math.max(1, h.targetPerDay ?? 1),
              reminderTime: reminderTimes[0],
              reminderTimes,
              notificationId: notificationIds[0],
              notificationIds,
              completions: [],
              createdAt: new Date().toISOString(),
            },
          ],
        }))
        return id
      },
      updateHabit: (id, partial) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h

            const next = { ...h, ...partial }
            const reminderTimes = (next.reminderTimes?.length ? next.reminderTimes : next.reminderTime ? [next.reminderTime] : [])
              .filter(Boolean)
            const notificationIds = (next.notificationIds?.length ? next.notificationIds : next.notificationId ? [next.notificationId] : [])
              .filter(Boolean) as string[]

            return {
              ...next,
              targetPerDay: Math.max(1, next.targetPerDay ?? 1),
              reminderTime: reminderTimes[0],
              reminderTimes,
              notificationId: notificationIds[0],
              notificationIds,
            }
          }),
        })),
      deleteHabit: (id) => {
        const existing = get().habits.find((h) => h.id === id)
        const notificationIds = [
          ...(existing?.notificationIds ?? []),
          ...(existing?.notificationId ? [existing.notificationId] : []),
        ]

        for (const notificationId of notificationIds) {
          void cancelNotification(notificationId)
        }

        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
      },
      checkInHabit: (id) => {
        const today = getTodayString()
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id) return h
            const currentCount = getCompletionCountForDate(h, today)
            if (currentCount >= getTargetPerDay(h)) return h
            return { ...h, completions: [...h.completions, today] }
          }),
        }))
      },
      isCompletedToday: (id) => {
        const today = getTodayString()
        const habit = get().habits.find((h) => h.id === id)
        if (!habit) return false
        return getCompletionCountForDate(habit, today) >= getTargetPerDay(habit)
      },
      getCompletedCountToday: (id) => {
        const today = getTodayString()
        const habit = get().habits.find((h) => h.id === id)
        if (!habit) return 0
        return getCompletionCountForDate(habit, today)
      },
      getStreak: (id) => {
        const habit = get().habits.find((h) => h.id === id)
        if (!habit) return 0
        let streak = 0
        for (let i = 0; i < 365; i++) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          if (getCompletionCountForDate(habit, toLocalDateString(d)) >= getTargetPerDay(habit)) streak++
          else break
        }
        return streak
      },
      getWeekGrid: (id) => {
        const habit = get().habits.find((h) => h.id === id)
        return Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return habit ? getCompletionCountForDate(habit, toLocalDateString(d)) >= getTargetPerDay(habit) : false
        })
      },
    }),
    { name: 'habit-store', storage: createJSONStorage(() => storage) },
  ),
)
