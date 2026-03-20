import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '@/utils/storage'
import { MoodEntry, MoodLevel } from '@/types'
import { generateId } from '@/utils/dateHelpers'

interface MoodState {
  entries: MoodEntry[]
  logMood: (mood: MoodLevel, note?: string) => void
  getTodayMood: () => MoodEntry | undefined
  getLast30Days: () => MoodEntry[]
}

export const useMoodStore = create<MoodState>()(
  persist(
    (set, get) => ({
      entries: [],
      logMood: (mood, note) => {
        const today = new Date().toISOString().split('T')[0]
        set((s) => {
          const exists = s.entries.find((e) => e.date === today)
          if (exists) return { entries: s.entries.map((e) => e.date === today ? { ...e, mood, note } : e) }
          return { entries: [...s.entries, { id: generateId(), date: today, mood, note, createdAt: new Date().toISOString() }] }
        })
      },
      getTodayMood: () => get().entries.find((e) => e.date === new Date().toISOString().split('T')[0]),
      getLast30Days: () => Array.from({ length: 30 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (29 - i))
        return get().entries.find((e) => e.date === d.toISOString().split('T')[0])
      }).filter(Boolean) as MoodEntry[],
    }),
    { name: 'mood-store', storage: createJSONStorage(() => storage) },
  ),
)
