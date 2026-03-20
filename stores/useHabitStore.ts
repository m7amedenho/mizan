import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '@/utils/storage'
import { Habit } from '@/types'
import { generateId } from '@/utils/dateHelpers'
import { cancelNotification } from '@/utils/notifications'

interface HabitState {
  habits: Habit[]
  addHabit: (h: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => string
  updateHabit: (id: string, partial: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  checkInHabit: (id: string) => void
  isCompletedToday: (id: string) => boolean
  getStreak: (id: string) => number
  getWeekGrid: (id: string) => boolean[]
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      addHabit: (h) => {
        const id = generateId()
        set((s) => ({ habits: [...s.habits, { ...h, id, completions: [], createdAt: new Date().toISOString() }] }))
        return id
      },
      updateHabit: (id, partial) =>
        set((s) => ({ habits: s.habits.map((h) => h.id === id ? { ...h, ...partial } : h) })),
      deleteHabit: (id) => {
        const existing = get().habits.find((h) => h.id === id)
        if (existing?.notificationId) {
          void cancelNotification(existing.notificationId)
        }
        set((s) => ({ habits: s.habits.filter((h) => h.id !== id) }))
      },
      checkInHabit: (id) => {
        const today = new Date().toISOString().split('T')[0]
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== id || h.completions.includes(today)) return h
            return { ...h, completions: [...h.completions, today] }
          }),
        }))
      },
      isCompletedToday: (id) => {
        const today = new Date().toISOString().split('T')[0]
        return get().habits.find((h) => h.id === id)?.completions.includes(today) ?? false
      },
      getStreak: (id) => {
        const habit = get().habits.find((h) => h.id === id)
        if (!habit) return 0
        let streak = 0
        for (let i = 0; i < 365; i++) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          if (habit.completions.includes(d.toISOString().split('T')[0])) streak++
          else break
        }
        return streak
      },
      getWeekGrid: (id) => {
        const habit = get().habits.find((h) => h.id === id)
        return Array.from({ length: 7 }, (_, i) => {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          return habit?.completions.includes(d.toISOString().split('T')[0]) ?? false
        })
      },
    }),
    { name: 'habit-store', storage: createJSONStorage(() => storage) },
  ),
)
