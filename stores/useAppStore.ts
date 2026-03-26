import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '@/utils/storage'
import { AppSettings, Badge, BadgeType } from '@/types'

interface AppState {
  settings: AppSettings
  badges: Badge[]
  updateSettings: (partial: Partial<AppSettings>) => void
  unlockBadge: (type: BadgeType) => void
  hasBadge: (type: BadgeType) => boolean
}

const defaultSettings: AppSettings = {
  userName: '',
  isOnboarded: false,
  pomodoroFocus: 25,
  pomodoroShortBreak: 5,
  pomodoroLongBreak: 15,
  balanceHidden: false,
  notificationsEnabled: true,
  appLockEnabled: false,
  biometricEnabled: false,
  autoSaveSalaryEnabled: true,
  autoSaveSalaryRate: 15,
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      badges: [],
      updateSettings: (partial) =>
        set((s) => ({ settings: { ...s.settings, ...partial } })),
      unlockBadge: (type) => {
        if (get().hasBadge(type)) return
        set((s) => ({
          badges: [...s.badges, { type, unlockedAt: new Date().toISOString() }],
        }))
      },
      hasBadge: (type) => get().badges.some((b) => b.type === type),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => storage),
      merge: (persistedState, currentState) => {
        const incoming = (persistedState as Partial<AppState>) ?? {}
        return {
          ...currentState,
          ...incoming,
          settings: {
            ...defaultSettings,
            ...(incoming.settings ?? {}),
          },
          badges: incoming.badges ?? currentState.badges,
        }
      },
    },
  ),
)
