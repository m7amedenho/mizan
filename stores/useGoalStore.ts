import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { storage } from '@/utils/storage'
import { Goal, Challenge } from '@/types'
import { generateId } from '@/utils/dateHelpers'

interface GoalState {
  goals: Goal[]
  challenges: Challenge[]
  addGoal: (g: Omit<Goal, 'id' | 'createdAt'>) => string
  updateGoal: (id: string, partial: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  toggleSubGoal: (goalId: string, subGoalId: string) => void
  addChallenge: (c: Omit<Challenge, 'id' | 'createdAt' | 'checkIns'>) => string
  checkInChallenge: (id: string) => void
  deleteChallenge: (id: string) => void
  getChallengeStreak: (id: string) => number
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [], challenges: [],
      addGoal: (g) => { const id = generateId(); set((s) => ({ goals: [...s.goals, { ...g, id, createdAt: new Date().toISOString() }] })); return id },
      updateGoal: (id, partial) => set((s) => ({ goals: s.goals.map((g) => g.id === id ? { ...g, ...partial } : g) })),
      deleteGoal: (id) => set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      toggleSubGoal: (goalId, subGoalId) => set((s) => ({
        goals: s.goals.map((g) => {
          if (g.id !== goalId) return g
          const subGoals = g.subGoals.map((sg) => sg.id === subGoalId ? { ...sg, completed: !sg.completed } : sg)
          return { ...g, subGoals, completed: subGoals.every((sg) => sg.completed) }
        }),
      })),
      addChallenge: (c) => { const id = generateId(); set((s) => ({ challenges: [...s.challenges, { ...c, id, checkIns: [], createdAt: new Date().toISOString() }] })); return id },
      checkInChallenge: (id) => {
        const today = new Date().toISOString().split('T')[0]
        set((s) => ({
          challenges: s.challenges.map((c) => {
            if (c.id !== id || c.checkIns.includes(today)) return c
            const checkIns = [...c.checkIns, today]
            return { ...c, checkIns, completed: checkIns.length >= c.durationDays, completedAt: checkIns.length >= c.durationDays ? new Date().toISOString() : undefined }
          }),
        }))
      },
      deleteChallenge: (id) => set((s) => ({ challenges: s.challenges.filter((c) => c.id !== id) })),
      getChallengeStreak: (id) => {
        const c = get().challenges.find((c) => c.id === id)
        if (!c) return 0
        let streak = 0
        for (let i = 0; i < c.durationDays; i++) {
          const d = new Date(); d.setDate(d.getDate() - i)
          if (c.checkIns.includes(d.toISOString().split('T')[0])) streak++
          else break
        }
        return streak
      },
    }),
    { name: 'goal-store', storage: createJSONStorage(() => storage) },
  ),
)
